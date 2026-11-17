## For the custom column that the plugin registers
# citationcounts-column-title = Citations

## For the "Item" contextmenu, where citation counts can be manually retrieved for the selected items.
citationcounts-itemmenu-retrieve-title =
    .label = Get citation count
citationcounts-itemmenu-retrieve-api =
    .label = Get { $api } citation count

## For the ProgressWindow, showing citation counts retrieval operation status
citationcounts-progresswindow-headline = Getting { $api } citation counts.
citationcounts-progresswindow-finished-headline = Finished getting { $api } citation counts.
citationcounts-progresswindow-error-no-doi = No DOI field exists on the item.
citationcounts-progresswindow-error-no-arxiv = No arXiv id found on the item.
citationcounts-progresswindow-error-no-doi-or-arxiv = No DOI / arXiv ID found on the item.
citationcounts-progresswindow-error-bad-api-response = Problem accesing the { $api } API.
citationcounts-progresswindow-error-no-citation-count = { $api } doesn't have a citation count for this item.
citationcounts-progresswindow-error-no-title = No title is available. Add a title and try again.
citationcounts-progresswindow-error-no-title-match = No usable title match was found in OpenAlex.
citationcounts-progresswindow-selection-required = OpenAlex matches need confirmation. Use the item's right-click command to choose a work.
citationcounts-progresswindow-selection-skipped = Kept the current citation count.
citationcounts-progresswindow-error-selection = Could not update the citation count. Try manual retrieval again.

## For the "Tools" menu, where the "autoretrieve" preference can be set.
citationcounts-menutools-autoretrieve-title =
    .label = Get citation counts for new items?
citationcounts-menutools-autoretrieve-api =
    .label = { $api }
citationcounts-menutools-autoretrieve-api-none =
    .label = No

## For the plugins "Preferences" pane.
citationcounts-preference-pane-label = Citation Counts
citationcounts-preferences-pane-autoretrieve-title = Get citation counts for new items?
citationcounts-preferences-pane-autoretrieve-api =
    .label = { $api }
citationcounts-preferences-pane-autoretrieve-api-none =
    .label = No
citationcounts-preferences-pane-missing-doi-title = Missing DOI Search Strategy (Crossref):
citationcounts-preferences-pane-missing-doi-strategy =
    .label = Try title-based search (results may be inaccurate)

## OpenAlex preferences and candidate selection
citationcounts-preferences-openalex-title = OpenAlex
citationcounts-preferences-openalex-api-key = API key (optional)
citationcounts-preferences-openalex-api-key-description = Leave empty for anonymous access. A free OpenAlex API key provides a higher usage allowance.
citationcounts-preferences-openalex-title-fallback =
    .label = Search by title when a DOI is missing or cannot be found
citationcounts-openalex-dialog-window =
    .title = Select an OpenAlex match
citationcounts-openalex-dialog-buttons =
    .buttonlabelaccept = Confirm
    .buttonlabelcancel = Cancel
citationcounts-openalex-select-description = Choose the matching work for this Zotero item, or keep the current citation count.
citationcounts-openalex-select-candidates = OpenAlex results
citationcounts-openalex-select-none = None of these; keep the current citation count
citationcounts-openalex-candidate-details = { $authors } · { $year } · { $count } citations
    DOI: { $doi }

## Misc
citationcounts-internal-error = Internal error

