# Change Log

## 0.0.3

Added auto generated pseudo variables in snake_case, PascalCase, camelCase & CONSTANT_CASE for each passed variable

For example if you ask in config for a `moduleName` variable, then you can use it in templates as `${moduleName}`, `${ModuleName}`, `${module_name}` and `${MODULE_NAME}`, and if you pass 'slothTop' you will get `slothTop`, `SlothTop`, `sloth_top` and `SLOTH_TOP` in these vars.

Also specially for Flutter in Dart files added QuickFix option to create new widgets (`statelessWidget` template must be specified)

## 0.0.2

Added `insert` command

## 0.0.1

Released. Capability to create files from templates
