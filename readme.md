# js-dev-assistant [![NPM version][npm-image]][npm-url]

> CLI refactor code for JavaScript developers

## Install

```bash
$ npm install --global js-dev-assistant
```

## CLI

```
$ js-dev-assistant --help

Manipulate over source files - refactor, view, etc. not leaving a terminal (dev-assistant v2.0.0)

USAGE dev-assistant [OPTIONS] [COMMAND]

ARGUMENTS

  COMMAND    An optional command name (refactor, view...), will be prompted interactively if not provided    

OPTIONS

                                      --root    Root folder to search files on
                                  -f, --file    source file name
                                      --hook    custom hook to perform over changed file
                          -p, --prettierHook    perform prettier format command over changed file 
                     --viewAfterManipulation    Run view file command after manipulation over file
```

You can provide a command name and file when issuing a command or by choosing from interactive prompts.
Filename also can be choosen from interactive prompt, or you can use --file option to specify source file.

Notes:

You can use the following convenient aliases (instead of `js-dev-assistant`): `dev-assistant`, `devasis`, `deva`, `refactorer`.

In view mode you can:

- scroll a content using arrow keys
- press `Ctrl+C` or `q` key in the keyboard in order to exit from program

Tips:

- to format modified file with prettier you can use `--prettier-hook` flag
- to run a custom command after job is performed you can use the `--hook` flag, (for example, `--hook "npm test"`) 


## Demo

![demo-demo](media/demo.gif)

[More examples and tips](https://github.com/akgondber/js-dev-assistant/blob/main/docs/highlighted-features.md)

## License

MIT © [Rushan Alyautdinov](https://github.com/akgondber)

[npm-image]: https://img.shields.io/npm/v/js-dev-assistant.svg?style=flat
[npm-url]: https://npmjs.org/package/js-dev-assistant
