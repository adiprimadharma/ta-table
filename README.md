# jQuery TA TABLE

A Responsive and customable table for jQuery.

<!-- ## Features

* Fade between tabs using **CSS3 transitions** with `.animate()` fallback
* Tested with jQuery **1.12.0+**
* Keyboard navigation
* WAI-ARIA (via http://www.accessibleculture.org/articles/2010/08/aria-tabs/)
* Focus on tab contents
* Touch events
* Flexible HTML
* Rotate tabs with a delay -->

## Installation

### npm

It's recommended to `require`/`import` the plugin as part of an existing webpack or browserify setup:

```
npm install jquery ta-table --save
```

```js
// import
const $ = require('jquery');
require('ta-table');

// construct template
    const checkBox = '<input type="checkbox" class="checklist" id="checkBox-16831344" data-index="0" data-id="16831344"><label for="checkBox-16831344" class="checklist-label"></label>';
    const statBtn = '<i class="ta-icon ta-icon-circle active-stat mr-10"></i><span>Aktif</span><i class="ta-icon ta-icon-tooltip info-not-show tooltip-action-trigger hide" data-type="product" data-id="16831344"></i>';
    const dataset = [
        ['<input type="checkbox" class="checklist" id="checkBox-16831345" data-index="0" data-id="16831345"><label for="checkBox-16831345" class="checklist-label"></label>',statBtn,'datacol3-row1','datacol4-row1','datacol5-row1','datacol6-row1','datacol7-row1','datacol8-row1', 'datacol9-row1', 'datacol10-row1', 'datacol11-row1'],
        ['<input type="checkbox" class="checklist" id="checkBox-16831346" data-index="0" data-id="16831346"><label for="checkBox-16831346" class="checklist-label"></label>',statBtn,'datacol3-row2','datacol4-row2','datacol5-row2','datacol6-row2','datacol7-row2','datacol8-row2', 'datacol9-row2', 'datacol10-row2', 'datacol11-row2'],
        ['<input type="checkbox" class="checklist" id="checkBox-16831347" data-index="0" data-id="16831347"><label for="checkBox-16831347" class="checklist-label"></label>',statBtn,'datacol3-row3','datacol4-row3','datacol5-row3','datacol6-row3','datacol7-row3','datacol8-row3', 'datacol9-row3', 'datacol10-row3', 'datacol11-row3'],
    ];

// init
    $('#table-dashboard').tatable({
        fixedColumns: 2,
        data: dataset,
        columns: [
            {title: checkBox, className: 'checklist', colIndex: 0, fixedWidth: true},
            {title: 'Title kolom-7', className: 'Table1classNameCol7', colIndex: 6, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 7'},
            {title: 'Title Kolom-3', className: 'Table1classNameCol3', colIndex: 2, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 3'},
            {title: 'Title Kolom-4 <div style="color: rgba(0,0,0,.38)">asdbaskbdasjdbas</div>', className: 'Table1classNameCol4', colIndex: 3, sort: true, tooltip: false},
            {title: 'Title Kolom-2', className: 'status', colIndex: 1, sort: true, tooltip: true, fixedWidth: false, dataTooltip: 'test Tooltip column 5'},
            {title: 'Title Kolom-8', className: 'Table1classNameCol8', colIndex: 7, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 8'},
            {title: 'Title Kolom-5', className: 'Table1classNameCol5', colIndex: 4, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 5'},
            {title: 'Title Kolom-6', className: 'Table1classNameCol6', colIndex: 5, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 6'},
            {title: 'Title Kolom-9', className: 'Table1classNameCol9', colIndex: 8, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 9'},
            {title: 'Title Kolom-10', className: 'Table1classNameCol10', colIndex: 9, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 10'},
            {title: 'Title Kolom-11', className: 'Table1classNameCol11', colIndex: 10, sort: true, tooltip: true, dataTooltip: 'test Tooltip column 11'},
        ]
    })
```

TA Table relies on jQuery as a `peerDependency` so ensure it is installed in
your application.

### Manual

Clone the repository and run `npm install && npm run build`. This will generate
a UMD version of the plugin in `./build` that can be dropped into a project
however you want.

```html
<script src="http://code.jquery.com/jquery-latest.js"></script>
<script src="tatable.js"></script>
```

<!-- **Note** Your navigation anchors must link to the tab content IDs (tab behaviour), or be fully-qualified URLs (follow link behaviour). -->

## Options

**Note** COMING SOON --
<!-- 
* **delay** - _(number)_ How long between each tab change. If set to 0 no timed change will happen _default_ `0`
* **duration** - _(number)_ If set to greater than zero, then this will decide how long it takes to fade transition between tabs otherwise it will be instant _default_ `0`
* **easing** - _(string)_ Easing type, works only with CSS3 capable browsers _default_ `ease-in-out`
* **startOn** - _(number)_ Index of the tab to show first _default_ `0`
* **reverse** - _(boolean)_ Will reverse display order of tabs when on a timed delay _default_ `false`
* **interactEvent** - _(string)_ Event to interact with the tab navigation. Possible values are `click` or `hover` _default_ `click`
* **useTouch** - _(boolean)_ - If the browser supports touch then Herotabs will try to use it instead of the `interactEvent` above _default_ `true`
* **useKeys** - _(boolean)_ - Attach key events _default_ `true`
* **onReady** - _(function)_ - Called when the plugin has successfully instantiated. _default_ `null`
* **onSetup** - _(function)_ - Called before the plugin has begun grabbing elements, setting up events etc. _default_ `null`
* **css** _(object)_  Classes applied to the HTML structure
  * **active** _(string)_ - Added to the container when the plugin has setup _default_ `is-active`
  * **current** _(string)_ - Added to the current visible tab panel _default_ `is-current-pane`
  * **navCurrent** _(string)_ - Added to current visible nav item _default_ `is-current-nav`
  * **navId** _(string)_ - id to add to each nav link. Becomes `herotabs1`, `herotabs2` etc _default_ `herotabs`
* **selectors** _(object)_ - CSS selectors to grab the HTML
  * **tab** _(string)_ The tab panel containing the content _default_ `.js-herotabs-tab`
  * **nav** _(string)_ The nav container _default_ `.js-herotabs-nav`
  * **navItem** _(string)_ Each navigation item _default_ `.js-herotabs-nav-item`
* **zIndex** _(object)_ z-index values applied to the tabs
  * **bottom** (number) Applied to all tabs _default_ `1`
  * **top** (number) Applied to the currently visible tab _default_ `2`

### Overriding defaults for all instances

If you have multiple instances of Herotabs on one page then defaults used by all of them can be accessed via `$.fn.herotabs.defaults`:

```js
$.fn.herotabs.defaults.css.current = 'this-is-the-current-class';

// Create some instances
$('.tabs').herotabs();
$('.other-tabs').herotabs();

// Both will use `this-is-the-current-class`
```

## Events

Herotabs fires various events that you can listen to. They are fired off the element that `herotabs` is instantiated  on.

```js
const $tabs = $('.tabs').herotabs();

$tabs.on('herotabs.show', function() {
  // Do something when the tab shows!
});

$tabs.on('herotabs.show', function() {
  // Do something else when the tab has shown!
});
```

### Event parameters

Every event handler receives the jQuery event object and also the current
visible tab, the index and the current selected nav item.

* **tab** - _(jQuery object)_ The currently visible tab
* **index** - _(number)_ The index of the currently visible tab
* **nav** - _(jQuery object)_ The current selected nav item

```js
var $tabs = $('.tabs').herotabs();

$tabs.on('herotabs.show', function(event, $tab, $index, $nav) {
  $tab.addClass('currently-visible-tab');
  $('body').text('The current tab index is ' + $index);
  $nav.text('I am the current nav element');
});
```

### herotabs.show

Fired when a tab is shown

### herotabs.hide

Fired when the current tab is hidden

### herotabs.next

Fired when the next tab is shown

### herotabs.prev

Fired when the previous tab is shown

### herotabs.start

Fired after the tabs have begun cycling on a timed delay

### herotabs.stop

Fired after the tabs have stopped cycling

### herotabs.mouseenter

Fired when the mouse enters the container of the tabs

### herotabs.mouseleave

Fired when the mouse leaves the container of the tabs

## Methods

You can get at the Herotabs instance by accessing it from the elements `.data` method

```js
const instance = $('.tabs').herotabs().data('herotabs');
instance.nextTab();
```

### showTab

Shows a tab. Accepts a zero based index or a jQuery element

```js
instance.showTab(2) // Index
instance.showTab($('.js-herotabs-tab').eq(1)) // jQuery element
```

### nextTab

Shows the next tab. If the current tab is the last in the set it will show the first.

```js
instance.nextTab()
```

### prevTab

Shows the previous tab. If the current tab is the first in the set it will show the last.

```js
instance.prevTab()
```

### start

If a delay is set in the options, then it will begin cycling through the tabs.

```js
instance.start()
```

### stop

If the tabs are currently cycling, it will stop them

```js
instance.stop()
```

### triggerEvent

Manually invoke a Herotabs event. Accepts an event name and jQuery object/index

```js
instance.triggerEvent('herotabs.show', 2); // Use an index
instance.triggerEvent('herotabs.show', $('.a-single-tab')); // Or a jQuery object
```
Due to the events being attached after the plugin has initialised, this method might be useful if you have events that need to fire immediately or from somewhere else.

### Chaining

All methods return the instance so you can chain as many calls as you wish

```js
instance.showTab(2).nextTab().nextTab();
```

### Accessing the constructor

If for any reason you need to override or add your own methods then you can access the Herotabs prototype before initialising it:

```js
const Herotabs = $.fn.herotabs.Herotabs;
Herotabs.prototype.newMethod = function() {
    // Something new!
};

const instance = $('.tabs').herotabs().data('herotabs');
instance.newMethod();
```

#### CommonJS

```js
const Herotabs = require('jquery.herotabs');
Herotabs.prototype.newMethod = function() {
    // Something new!
};

var instance = $('.tabs').herotabs().data('herotabs');
instance.newMethod();
```

## Example

```js
$('.tabs')
  .herotabs({
    useTouch: false,
    duration: 400,
    interactEvent: 'hover',
    selectors: {
        tab: '.tab-panel',
        navItem: '.tab-nav-item',
        nav: '.tab-nav-container'
    },
    onSetup: function() {
      // Do some setup work here
      // e.g. generate some markup dynamically for Herotabs to attach to
    }
  })
  .on('herotabs.show', function(event, $tab) {
      $tab.text('You are looking at a tab!');
  });
```

## Contributing

If you find a bug or need a feature added, please open an issue first.

### Running the tests

    npm install
    npm test -->