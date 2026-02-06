# Zotero 8 Citation Counts Manager

- [GitHub](https://github.com/tangzhao20/zotero-citation-counts): Source code repository

This is an add-on for [Zotero](https://www.zotero.org), a research source management tool. The add-on can auto-fetch citation counts for journal articles using various APIs, including [Crossref](https://www.crossref.org), [INSPIRE-HEP](https://inspirehep.net), and [Semantic Scholar](https://www.semanticscholar.org).  
[Google Scholar](https://scholar.google.com) is not supported because automated access is against its terms of service.

Please report any bugs, questions, or feature requests in the Github repository.

## Features

- Autoretrieve citation counts when a new item is added to your Zotero library.
- Retrieve citation counts manually by right-clicking on one or more items in your Zotero library.
- Works with the following APIs: [Crossref](https://www.crossref.org), [INSPIRE-HEP](https://inspirehep.net) and [Semantic Scholar](https://www.semanticscholar.org).
- The plugin is compatible with **Zotero 8**.
- The plugin registers a custom column ("Citation Counts") in your Zotero library so that items can be ordered by citation count.
- Improved citation count retrieval operation status reporting, including item-specific error messages for those items where a citation count couldn't be retrieved.
- Concurrent citation count retrieval operations are now possible. Especially important for the autoretrieve feature.
- Fluent is used for localizing, while the locale files have been simplified and now cover the whole plugin. You are welcome to submit translations as a PR.
- *New*: Optionally search Crossref by title if an item lacks a DOI.

## Acknowledgements

This plugin is a refactored and enhanced version of [FrLars21's Zotero Citation Counts Manager](https://github.com/FrLars21/ZoteroCitationCountsManager), which in turn was based on [Erik Schnetter's Zotero Citations Counts Manager](https://github.com/eschnett/zotero-citationcounts). Code for that extension was based on [Zotero DOI Manager](https://github.com/bwiernik/zotero-shortdoi), which is based in part on [Zotero Google Scholar Citations](https://github.com/beloglazov/zotero-scholar-citations) by Anton Beloglazov.  
Boilerplate for this plugin was based on Zotero's sample plugin for v7 [Make-It-Red](https://github.com/zotero/make-it-red).  

## Installing

- Download the .xpi file from [the latest release](https://github.com/tangzhao20/zotero-citation-counts/releases)
- Run Zotero (version 8.x.x)
- Go to **Tools** -> **Plugins**
- Click the **gear icon** in the top right corner
- Select **Install Plugin From File...**
- Choose the file `zotero-citation-counts-v2.2.0.xpi`

## License

Distributed under the Mozilla Public License (MPL) Version 2.0.
