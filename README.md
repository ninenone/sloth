# Sloth

VSCode extension, allowing you to generate files from templates (with filling template values) and insert lines in existing files under some `tag`. For example, you can register created screen in the navigator

## Features

Define your templates like those in the example, write `config.json` like the one in the example and then use `Cmd + Shift + P` + `Sloth` to execute global command or Right Click -> `Run Sloth` to execute Local command.
Insert action only available in global commands.

## Installation

Download file `product/sloth-x.x.x.vsix`, run in terminal

```sh
code --install-extension sloth-x.x.x.vsix
```

## Build

To build an extension

```sh
npm install -g vsce
vsce package
```

## TODO
- Функции типа Capitalize(), lowercase(), snake_case(), camelCase()
- {{ forloop }}
- Поддержка нескольких проектов. (Sloth не работает если в explorer открыто несколько проектов)
