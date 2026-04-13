import React, { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { ResourceKey, SELL_PRICES, MarketplaceListing } from '@/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type Tab = 'global' | 'system' | 'mine';

export function MarketplacePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('global');

  return (
    <div className="flex flex-col h-[350px]">
      <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('global')}
          className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${activeTab === 'global' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white/90'}`}
        >
          🌍 Global Trade
        </button>
        <button 
          onClick={() => setActiveTab('mine')}
          className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${activeTab === 'mine' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white/90'}`}
        >
          📦 My Listings
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ml-auto ${activeTab === 'system' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/30 hover:text-white/60'}`}
        >
          System Scrapper
        </button>
      </div>

      <div className="flex-1 overflow-y-hidden flex flex-col">
        {activeTab === 'global' && <GlobalMarket />}
        {activeTab === 'mine' && <MyListings />}
        {activeTab === 'system' && <SystemMarket />}
      </div>
    </div>
  );
}

function GlobalMarket() {
  const { state, dispatch } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [buyAmount, setBuyAmount] = useState<Record<string, number>>({});

  const { data: listings, isLoading } = useQuery({
    queryKey: ['marketplace_listings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('marketplace_listings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as MarketplaceListing[];
    },
    refetchInterval: 5000
  });

  const buyMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
      const { data, error } = await (supabase as any).rpc('buy_marketplace_item', { p_listing_id: id, p_amount: amount });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const listing = listings?.find(l => l.id === variables.id);
      if (listing) {
        dispatch({ type: 'MARKET_BUY', resource: listing.resource, amount: variables.amount, totalCost: variables.amount * listing.price_per_unit });
        toast({ title: 'Purchase Successful', description: `Bought ${variables.amount}x ${listing.resource.replace(/_/g, ' ')}` });
      }
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
    },
    onError: (error) => {
      toast({ title: 'Transaction Failed', description: error.message, variant: 'destructive' });
    }
  });

  if (isLoading) return <div className="text-center py-8 text-white/50 animate-pulse">Loading global market...</div>;
  if (!listings || listings.length === 0) return <div className="text-center py-8 text-white/50">The global market is entirely empty.</div>;

  const filteredListings = listings.filter(l => l.seller_id !== user?.id && l.resource.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <input 
          type="text" 
          placeholder="Search global markets..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-all font-medium"
        />
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {filteredListings.length === 0 && (
          <div className="text-center py-8 text-xs opacity-40 italic">No listings match your search.</div>
        )}
        {filteredListings.map(listing => {
          const cost = listing.price_per_unit * (buyAmount[listing.id] || 1);
          const canAfford = state.currency >= cost;

          return (
            <div key={listing.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase text-emerald-300">{listing.resource.replace(/_/g, ' ')}</span>
                <span className="text-[10px] opacity-60">Seller: {listing.seller_email}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-mono text-white/80">{listing.amount} available</span>
                  <span className="text-[10px] text-amber-400 font-bold">${listing.price_per_unit.toFixed(2)} / ea</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    max={listing.amount} 
                    value={buyAmount[listing.id] || 1} 
                    onChange={(e) => setBuyAmount({...buyAmount, [listing.id]: Math.min(listing.amount, Math.max(1, Number(e.target.value)))})}
                    className="w-16 bg-black/30 border border-white/20 rounded px-2 py-1 text-xs text-white"
                  />
                  <button
                    onClick={() => buyMutation.mutate({ id: listing.id, amount: buyAmount[listing.id] || 1 })}
                    disabled={!canAfford || buyMutation.isPending}
                    className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs whitespace-nowrap"
                  >
                    {buyMutation.isPending ? 'Processing...' : `Buy ($${cost.toFixed(2)})`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyListings() {
  const { state, dispatch } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const [resource, setResource] = useState<ResourceKey>('iron_ore');
  const [amount, setAmount] = useState<number>(1);
  const [price, setPrice] = useState<number>(1.00);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle();
      return data;
    },
    refetchInterval: 5000
  });

  const { data: myLists } = useQuery({
    queryKey: ['marketplace_listings', 'mine'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('marketplace_listings').select('*').eq('seller_id', user?.id);
      return data as MarketplaceListing[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from('marketplace_listings').insert({
        seller_id: user?.id!,
        seller_email: user?.email!,
        resource,
        amount,
        price_per_unit: price
      });
      if (error) throw error;
    },
    onSuccess: () => {
      dispatch({ type: 'MARKET_SELL', resource, amount });
      toast({ title: 'Listing Created', description: `Your ${resource} is now live on the market!` });
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
    }
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc('claim_pending_balance');
      if (error) throw error;
      return data as number;
    },
    onSuccess: (amount) => {
      dispatch({ type: 'MARKET_CLAIM_CASH', amount });
      toast({ title: 'Cash Claimed!', description: `Added $${amount.toFixed(2)} to your wallet.` });
      // Invalidate to zero out immediately on UI
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from('marketplace_listings').delete().eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] })
  });

  const inventoryKeys = Object.keys(state.inventory).filter(k => (state.inventory[k as ResourceKey] || 0) >= 1);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Inbox section */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between shrink-0">
        <div>
          <div className="text-xs uppercase text-amber-500/70 font-bold mb-1">Escrow Inbox</div>
          <div className="text-2xl font-black text-amber-400">${((profile as any)?.pending_balance || 0).toFixed(2)}</div>
          <div className="text-[10px] opacity-50">Earnings from offline sales</div>
        </div>
        <button
          onClick={() => claimMutation.mutate()}
          disabled={!(profile as any)?.pending_balance || (profile as any).pending_balance <= 0 || claimMutation.isPending}
          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400"
        >
          {claimMutation.isPending ? 'Claiming...' : 'Claim Cash'}
        </button>
      </div>

      {/* Create Listing Section */}
      <div className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-3 shrink-0">
        <div className="text-xs font-bold uppercase opacity-50 border-b border-white/10 pb-2">Create New Listing</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase opacity-70">Item to Sell</label>
            <select 
              className="bg-black/40 border border-white/20 rounded p-1 text-xs"
              value={resource} onChange={e => setResource(e.target.value as ResourceKey)}
            >
              {inventoryKeys.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase opacity-70">Amount</label>
            <input 
              type="number" min="1" max={Math.floor(state.inventory[resource as ResourceKey] || 0)} 
              value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="bg-black/40 border border-white/20 rounded p-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase opacity-70">Price per unit ($)</label>
            <input 
              type="number" min="0.01" step="0.1" 
              value={price} onChange={e => setPrice(Number(e.target.value))}
              className="bg-black/40 border border-white/20 rounded p-1 text-xs"
            />
          </div>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={!inventoryKeys.includes(resource) || amount < 1 || amount > (state.inventory[resource as ResourceKey] || 0) || createMutation.isPending}
          className="w-full py-2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          {createMutation.isPending ? 'Listing...' : 'List on Market'}
        </button>
      </div>

      {/* Active Listings */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="text-xs font-bold uppercase opacity-50 mb-2 shrink-0 border-b border-white/10 pb-2">Your Active Listings</div>
        
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <input 
            type="text" 
            placeholder="Search your listings..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition-all font-medium"
          />
        </div>

        <div className="overflow-y-auto pr-1 scrollbar-thin space-y-2">
          {myLists?.length === 0 && <div className="text-xs opacity-40 italic">You have no active listings.</div>}
          {myLists?.filter(l => l.resource.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase())).length === 0 && myLists?.length > 0 && (
            <div className="text-xs opacity-40 italic">No listings match your search.</div>
          )}
          {myLists?.filter(l => l.resource.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase())).map(listing => (
            <div key={listing.id} className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/80">{listing.amount}x {listing.resource.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-amber-400">${listing.price_per_unit.toFixed(2)}/ea</span>
              </div>
              <button 
                onClick={() => deleteMutation.mutate(listing.id)}
                className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-bold hover:bg-red-500/30"
              >
                Cancel (No Refund)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemMarket() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState('');

  const sellAll = () => {
    Object.keys(state.inventory).forEach(key => {
      const amount = Math.floor(state.inventory[key as ResourceKey] || 0);
      if (amount > 0) dispatch({ type: 'SELL', resource: key, amount });
    });
  };

  const sellableKeys = Object.keys(SELL_PRICES).filter(key => {
    const amount = state.inventory[key as ResourceKey] || 0;
    if (amount < 1) return false;
    if (search.trim() === '') return true;
    return key.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 border-b border-red-500/20 pb-3 shrink-0">
        <div>
          <div className="text-xs uppercase tracking-wider text-red-400/80 font-bold mb-1">System Scrapper</div>
          <div className="text-[10px] opacity-70">Instant cash, but terrible prices. Ideal for dumping trash ores.</div>
        </div>
        <button onClick={sellAll} className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500/30 text-red-300 hover:bg-red-500/50 border border-red-500/50 whitespace-nowrap">
          Dump All Inventory
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <input 
          type="text" 
          placeholder="Search items to scrap..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-red-500/50 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1 scrollbar-thin">
        {sellableKeys.map(key => {
          const amount = state.inventory[key as ResourceKey] || 0;
          const price = SELL_PRICES[key as ResourceKey] || 0;
          
          return (
            <div key={key} className="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-white/5 h-[50px]">
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate uppercase tracking-tighter font-bold">{key.replace(/_/g, ' ')}</div>
                <div className="text-[10px] opacity-50 font-mono">${price.toFixed(2)}/ea • {Math.floor(amount)}</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'SELL', resource: key, amount: Math.floor(amount) })}
                className="px-3 py-1 rounded text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/5 h-full"
              >
                Dump
              </button>
            </div>
          );
        })}
        {sellableKeys.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs opacity-40 italic">No scappable items match your search.</div>
        )}
      </div>
    </div>
  );
}
