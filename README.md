# check-for-cache

This is a fork of [martijnhols/actions-cache] at version 3.0.4 but only contains a slimmed down version of the [check] action.  

This action will check if an exact match is available in the cache without downloading it.  Caches have unique versions based on the compression tool used and the path of the directories being cached.  As a result, caches generated on one OS cannot be restored on a machine with a different OS.  See [actions/cache docs] for more details.

If you need an action that downloads or saves a cache, checkout the official [actions/cache] action.

## Index <!-- omit in toc -->

- [check-for-cache](#check-for-cache)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Usage Examples](#usage-examples)
  - [Contributing](#contributing)
    - [Incrementing the Version](#incrementing-the-version)
    - [Source Code Changes](#source-code-changes)
    - [Recompiling Manually](#recompiling-manually)
    - [Updating the README.md](#updating-the-readmemd)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)

## Inputs

| Parameter | Is Required | Description                                                                               |
|-----------|-------------|-------------------------------------------------------------------------------------------|
| `path`    | true        | The list of files, directories and wildcard patterns that were used when saving the cache |
| `key`     | true        | The key for the cache to check                                                            |

## Outputs

| Output        | Description                                                        | Possible Values |
|---------------|--------------------------------------------------------------------|-----------------|
| `cache-hit`   | Flag indicating whether an exact match was found for the cache key | `true,false`    |
| `primary-key` | The key for the cache (same as `key` input)                        |                 |

## Usage Examples

```yml

jobs:
  setup-caches:
    runs-on: ubuntu-20.04
    outputs:
      NPM_CACHE_KEY: ${{ env.NPM_CACHE_KEY }}
      HAS_NPM_CACHE: ${{ steps.has-npm-cache.outputs.cache-hit }}
      
    steps:
      - uses: actions/checkout@v3
        
      - name: Set Cache Keys
        run: echo "NPM_CACHE_KEY=node_modules-${{ hashFiles('package-lock.json', '**/package-lock.json') }}" >> $GITHUB_ENV
          
      - name: Check for an npm cache
        id: has-npm-cache
        # You may also reference the major or major.minor version
        uses: im-open/check-for-cache@v1.1.6
        with:
          paths:  '**/node_modules'
          key: ${{ env.NPM_CACHE_KEY }}
      
  create-npm-cache:
    runs-on: ubuntu-20.04
    needs: [ setup-caches ]
    if: needs.setup-caches.outputs.HAS_NPM_CACHE == 'false'
    steps:
      - uses: actions/checkout@v3
        
      # This action will upload the node_modules dir to the cache if the job completes successfully.
      # Subsequent jobs/workflow runs can use this cached copy if the package-lock.json hasn't changed
      # and they are also using a ubuntu-20.04 runner to restore the cache from.
      - name: Setup caching for node_modules directory
        uses: actions/cache@v2
        id: module-cache
        with:
          key: ${{ needs.set-cache-keys.outputs.NPM_MODULES_CACHE_KEY }}
          path: '**/node_modules'

      - run: npm ci
  
  jest:
    runs-on: ubuntu-20.04
    needs: [ setup-caches, create-npm-cache ]
    steps:
      - uses: actions/checkout@v3
        
      - name: Download the node_modules folder from the cache
        id: get-cached-node-modules
        uses: im-open/restore-cache@v1
        with:
          key: ${{ needs.set-cache-keys.outputs.NPM_MODULES_CACHE_KEY }}
          path: '**/node_modules'

      - name: Rebuild Node Modules
        run: npm rebuild

      - name: jest test with coverage
        run: npm test -- --json --outputFile=jest-results.json --coverage
      
    
```

## Contributing

When creating PRs, please review the following guidelines:

- [ ] The action code does not contain sensitive information.
- [ ] At least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version] for major and minor increments.
- [ ] The action has been recompiled.  See [Recompiling Manually] for details.
- [ ] The README.md has been updated with the latest version of the action.  See [Updating the README.md] for details.

### Incrementing the Version

This repo uses [git-version-lite] in its workflows to examine commit messages to determine whether to perform a major, minor or patch increment on merge if [source code] changes have been made.  The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
|----------------|---------------------------------------------|
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

### Source Code Changes

The files and directories that are considered source code are listed in the `files-with-code` and `dirs-with-code` arguments in both the [build-and-review-pr] and [increment-version-on-merge] workflows.  

If a PR contains source code changes, the README.md should be updated with the latest action version and the action should be recompiled.  The [build-and-review-pr] workflow will ensure these steps are performed when they are required.  The workflow will provide instructions for completing these steps if the PR Author does not initially complete them.

If a PR consists solely of non-source code changes like changes to the `README.md` or workflows under `./.github/workflows`, version updates and recompiles do not need to be performed.

### Recompiling Manually

This command utilizes [esbuild] to bundle the action and its dependencies into a single file located in the `dist` folder.  If changes are made to the action's [source code], the action must be recompiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build
```

### Updating the README.md

If changes are made to the action's [source code], the [usage examples] section of this file should be updated with the next version of the action.  Each instance of this action should be updated.  This helps users know what the latest tag is without having to navigate to the Tags page of the repository.  See [Incrementing the Version] for details on how to determine what the next version will be or consult the first workflow run for the PR which will also calculate the next version.

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2023, Extend Health, LLC. Code released under the [MIT license](LICENSE).

<!-- Links -->
[Incrementing the Version]: #incrementing-the-version
[Recompiling Manually]: #recompiling-manually
[Updating the README.md]: #updating-the-readmemd
[source code]: #source-code-changes
[usage examples]: #usage-examples
[build-and-review-pr]: ./.github/workflows/build-and-review-pr.yml
[increment-version-on-merge]: ./.github/workflows/increment-version-on-merge.yml
[esbuild]: https://esbuild.github.io/getting-started/#bundling-for-node
[git-version-lite]: https://github.com/im-open/git-version-lite
[actions/cache docs]: https://github.com/actions/cache#cache-version
[actions/cache]: https://github.com/actions/cache
[check]: https://github.com/MartijnHols/actions-cache/blob/main/check/action.yml
[martijnhols/actions-cache]: https://github.com/MartijnHols/actions-cache
