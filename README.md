# react-selectors

This package provides selector that make it easier to test ReactJS components.

## Install

`$ npm install react-selectors`

## Usage

#### Create selectors for ReactJS components

`ReactSelector` allows you to select page elements by the name of the component class or the nested component element.

Suppose you have the following JSX.

```jsx
<TodoApp className="todo-app">
    <TodoInput />
    <TodoList>
        <TodoItem priority="High">Item 1</TodoItem>
        <TodoItem priority="Low">Item 2</TodoItem>
    </TodoList>

    <div className="items-count">Items count: <span>{this.state.itemCount}</span></div>
</TodoApp>
```

To get a root DOM element for a component, pass the component name to the `getReactSelector` constructor.

```js
import { getReactSelector } from 'react-selectors';
const roots = [document.getElementById("root")];
const ReactSelector = getReactSelector(roots);

const todoInput = ReactSelector('TodoInput');
```

To obtain a nested component or DOM element, you can use a combined selector or add DOM element's tag name.

```js
import { getReactSelector } from 'react-selectors';
const roots = [document.getElementById("root")];
const ReactSelector = getReactSelector(roots);

const TodoList         = ReactSelector('TodoApp TodoList');
const itemsCountStatus = ReactSelector('TodoApp div');
const itemsCount       = ReactSelector('TodoApp div span');
```

Warning: if you specify a DOM element’s tag name, React selectors search for the element among the component’s children without looking into nested components. For instance, for the JSX above the `ReactSelector('TodoApp div')` selector will be equal to `$('.todo-app > div')`.

#### Limitations

* `react-selectors` support ReactJS starting with version 16. To check if a component can be found, use the [react-dev-tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) extension.
* Search for a component starts from the root React component, so selectors like `ReactSelector('body MyComponent')` will return `null`.
* ReactSelectors need class names to select components on the page. Code minification usually does not keep the original class names. So you should either use non-minified code or configure the minificator to keep class names.

  For `babel-minify`, add the following options to the configuration:

  ```js
  { keepClassName: true, keepFnName: true }
  ```

  In UglifyJS, use the following configuration:

   ```js
   {
       compress: {
           keep_fnames: true
       },

       mangle: {
           keep_fnames: true
       }
   }
   ```
