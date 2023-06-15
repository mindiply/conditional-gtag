# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.0.8] - 2023-06-15
### New
- Added initialization parameter *startupDefaultCmds* that allows calling
  configuration gtag commands, like for instance setting up cookie consent
- Added init property *isTrackingAllowedFn*, that will disable Google Analytics if the
  function returns true. The function is checked every time we make a programmatic request to the
  api

## [0.0.7] - 2023-06-08
### Fixes
- recordNewView now sets a new page view according to the latest gtag docs

## [0.0.6] - 2019-09-25
### Fixes
- Fixed exception on server side

## [0.0.5] - 2019-09-25
### New
- Added *disableInitialPageView* parameter to stop sending an initial pageview on first page render.
Useful if you have a SPA that uses client side routing, and want to track which page is viewed using
client code linked to the router.

## [0.0.4] - 2019-09-25
### New
- Initial working version
