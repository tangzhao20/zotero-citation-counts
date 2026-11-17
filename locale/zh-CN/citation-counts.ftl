## For the custom column that the plugin registers
# citationcounts-column-title = 引用数

## For the "Item" contextmenu, where citation counts can be manually retrieved for the selected items.
citationcounts-itemmenu-retrieve-title =
    .label = 获取被引用量
citationcounts-itemmenu-retrieve-api =
    .label = 从 { $api } 获取被引用量

## For the ProgressWindow, showing citation counts retrieval operation status
citationcounts-progresswindow-headline = 从 { $api } 获取被引用量
citationcounts-progresswindow-finished-headline = 已完成从 { $api } 获取被引用量
citationcounts-progresswindow-error-no-doi = 文章信息中不存在Doi条目
citationcounts-progresswindow-error-no-arxiv = 文章信息中不存在arXiv id
citationcounts-progresswindow-error-no-doi-or-arxiv = 文章信息中不存在Doi条目和arXiv id
citationcounts-progresswindow-error-bad-api-response = 访问 { $api } API出现问题
citationcounts-progresswindow-error-no-citation-count = { $api } 中不存在该文章的被引用量数据
citationcounts-progresswindow-error-no-title = 条目缺少标题。填写标题后重试。
citationcounts-progresswindow-error-no-title-match = OpenAlex 中没有可用的标题匹配结果。
citationcounts-progresswindow-selection-required = OpenAlex 匹配结果需要确认。右键获取引用次数以选择文献。
citationcounts-progresswindow-selection-skipped = 已保留当前引用次数。
citationcounts-progresswindow-error-selection = 无法更新引用次数。请重试手动获取。

## For the "Tools" menu, where the "autoretrieve" preference can be set.
citationcounts-menutools-autoretrieve-title =
    .label = 从新的文章条目中获取被引用量？
citationcounts-menutools-autoretrieve-api =
    .label = { $api }
citationcounts-menutools-autoretrieve-api-none =
    .label = 不获取

## For the plugins "Preferences" pane.
citationcounts-preference-pane-label = Citation count
citationcounts-preferences-pane-autoretrieve-title = 请选择获取被引用量的数据库来源
citationcounts-preferences-pane-autoretrieve-api =
    .label = { $api }
citationcounts-preferences-pane-autoretrieve-api-none =
    .label = 不获取
citationcounts-preferences-pane-missing-doi-title = 缺失 DOI 时的搜索策略 (Crossref)
citationcounts-preferences-pane-missing-doi-strategy =
    .label = 按标题搜索（结果可能不准确）

## OpenAlex preferences and candidate selection
citationcounts-preferences-openalex-title = OpenAlex
citationcounts-preferences-openalex-api-key = API key（可选）
citationcounts-preferences-openalex-api-key-description = 留空时匿名访问。免费的 OpenAlex API key 提供更高的使用额度。
citationcounts-preferences-openalex-title-fallback =
    .label = 缺少 DOI 或 DOI 查不到时，按标题搜索
citationcounts-openalex-dialog-window =
    .title = 选择 OpenAlex 匹配文献
citationcounts-openalex-dialog-buttons =
    .buttonlabelaccept = 确认
    .buttonlabelcancel = 取消
citationcounts-openalex-select-description = 为当前 Zotero 条目选择匹配文献，或保留当前引用次数。
citationcounts-openalex-select-candidates = OpenAlex 搜索结果
citationcounts-openalex-select-none = 以上都不是，保留当前引用次数
citationcounts-openalex-candidate-details = { $authors } · { $year } 年 · { $count } 次引用
    DOI：{ $doi }

## Misc
citationcounts-internal-error = 内部错误

