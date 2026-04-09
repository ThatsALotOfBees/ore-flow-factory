---
description: How to publish changes to GitHub for Lovable integration
---

This workflow ensures that updates are pushed to a specific branch on GitHub, allowing Lovable to pick up the changes for staging or publishing.

1. **Verify State**: Ensure all changes are committed and the working directory is clean (or stash if necessary).
2. **Determine Branch Name**: Use a descriptive name based on the update title or the specific fixes/additions (e.g., `feature/factory-plot-v0.8` or `fix/marketplace-rpc`).
3. **Create Branch**: Run `git checkout -b <branch-name>` to create and switch to the new branch.
4. **Push Branch**: Run `git push origin <branch-name>` to push the branch to the remote repository `https://github.com/ThatsALotOfBees/ore-flow-factory/`.
5. **Report**: Inform the user that the branch has been created and pushed.
