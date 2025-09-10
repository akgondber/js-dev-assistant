## Features

### Append item to array

You can add new item to array variable by choosing target variable from list and typing value that you want to add.

![Append item to array](../media/features/append-item-to-array.gif)

### Remove items from array

This feature allows you interactively select desired target variable from list of array variables and choose items you want to remove using arrow keys and selecting/unselecting items by pressing `space`.

![Remove items from array](../media/features/remove-items-from-array.gif)

### Add key-value to object

You can add key/value pair to object by selecting target variable from list and specify key and value in corresponding prompts

![Add key/value pair to object](../media/features/add-key-value-to-object.gif)

### Hook
There is the `--hook` option to specify some hook as a shell command you want to perform when manipulation have been performed.
You can specify, for example `npm test`, `prettier --write .` or some other hook.

![Hook feature](../media/features/hook.gif)

### View after manipulation

There is the `--viewAfterManipulation` option to display a file content after manipulation to inspect changed file.

![View after manipulation](../media/features/viewafter.gif)

#### Tips

There are handy aliases available: `--viaf`, `--thenView`, `viewAfter`.
