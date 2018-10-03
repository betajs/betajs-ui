# betajs-ui 1.0.48
[![Build Status](https://api.travis-ci.org/betajs/betajs-ui.svg?branch=master)](https://travis-ci.org/betajs/betajs-ui)
[![Code Climate](https://codeclimate.com/github/betajs/betajs-ui/badges/gpa.svg)](https://codeclimate.com/github/betajs/betajs-ui)
[![NPM](https://img.shields.io/npm/v/betajs-ui.svg?style=flat)](https://www.npmjs.com/package/betajs-ui)
[![Gitter Chat](https://badges.gitter.im/betajs/betajs-ui.svg)](https://gitter.im/betajs/betajs-ui)

BetaJS-UI is a library for enabling gestures and interactions such as drag and drop.



## Getting Started


You can use the library in the browser and compile it as well.

#### Browser

```javascript
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script src="betajs/dist/betajs.min.js"></script>
	<script src="betajs-browser/dist/betajs-browser.min.js"></script>
	<script src="betajs-dynamics/dist/betajs-ui.min.js"></script>
``` 

#### Compile

```javascript
	git clone https://github.com/betajs/betajs-ui.git
	npm install
	grunt
```



## Basic Usage


```js

    	BetaJS.UI.Interactions.Drag.multiple($(".doodad"), {
            enabled : true,
            clone_element: true
        }, function (drag) {
            drag.on("move", function (event) {
            	event.actionable_modifier.csscls("focus", true);
            	event.modifier.csscls("unfocus", true);
            });
        });
        
```

```html
    	<div class="doodads">
	        <div class="doodad"><div class="inner">Doodad 1</div></div>
	        <div class="doodad"><div class="inner">Doodad 2</div></div>
	        <div class="doodad"><div class="inner">Doodad 3</div></div>
	        <div class="doodad"><div class="inner">Doodad 4</div></div>
	        <div class="doodad"><div class="inner">Doodad 5</div></div>
    	</div>
```



## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [https://betajs.com](https://betajs.com) |
| Git        | [git://github.com/betajs/betajs-ui.git](git://github.com/betajs/betajs-ui.git) |
| Repository | [https://github.com/betajs/betajs-ui](https://github.com/betajs/betajs-ui) |
| Blog       | [https://blog.betajs.com](https://blog.betajs.com) | 
| Twitter    | [https://twitter.com/thebetajs](https://twitter.com/thebetajs) | 
| Gitter     | [https://gitter.im/betajs/betajs-ui](https://gitter.im/betajs/betajs-ui) | 



## Compatability
| Target | Versions |
| :----- | -------: |
| Firefox | 6 - Latest |
| Chrome | 18 - Latest |
| Safari | 5 - Latest |
| Opera | 12 - Latest |
| Internet Explorer | 8 - Latest |
| Edge | 12 - Latest |
| Yandex | Latest |
| iOS | 5.0 - Latest |
| Android | 2.3 - Latest |


## CDN
| Resource | URL |
| :----- | -------: |
| beta-ui.js | [http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui.js](http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui.js) |
| beta-ui.min.js | [http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui.min.js](http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui.min.js) |
| beta-ui-noscoped.js | [http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui-noscoped.js](http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui-noscoped.js) |
| beta-ui-noscoped.min.js | [http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui-noscoped.min.js](http://cdn.rawgit.com/betajs/betajs-ui/master/dist/betajs-ui-noscoped.min.js) |


## Unit Tests
| Resource | URL |
| :----- | -------: |
| Test Suite | [Run](http://rawgit.com/betajs/betajs-ui/master/tests/tests.html) |


## Dependencies
| Name | URL |
| :----- | -------: |
| betajs | [Open](https://github.com/betajs/betajs) |
| betajs-browser | [Open](https://github.com/betajs/betajs-browser) |


## Weak Dependencies
| Name | URL |
| :----- | -------: |
| betajs-scoped | [Open](https://github.com/betajs/betajs-scoped) |
| betajs-shims | [Open](https://github.com/betajs/betajs-shims) |


## Main Contributors

- Victor Lingenthal
- Oliver Friedmann

## License

Apache-2.0






## Sponsors

- Ziggeo
- Browserstack


