<h1><img src="animated-image-loader-logo.png" alt="animated image loader"></h1>

[![npm version](https://img.shields.io/npm/v/react-native-animated-image-loader.svg?style=for-the-badge)](https://www.npmjs.com/package/react-native-animated-image-loader)
[![npm](https://img.shields.io/npm/dt/react-native-animated-image-loader.svg?style=for-the-badge)](https://www.npmjs.com/package/react-native-animated-image-loader)
![Platform - Android and iOS](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue.svg?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![format prettier](https://img.shields.io/badge/format-prettier-ff69b4.svg?style=for-the-badge)](https://prettier.io)
[![lint-eslint](https://img.shields.io/badge/lint-eslint-4b32c3.svg?style=for-the-badge)](https://eslint.org/)

<table>
  <tr>
    <td align="center">
      <img alt="React Native Bouncy Checkbox"
        src="demo-ios.gif" />
    </td>
    <td align="center">
      <img alt="React Native Bouncy Checkbox"
        src="demo-gms.gif" />
    </td>
   </tr>
</table>

## Installation

Add the dependency: 🤔

<b>Zero Dependency</b> 🥳

### React Native
```sh
npm install react-native-animated-image-loader
```
```sh
yarn add react-native-animated-image-loader
```

### Import
```js
import AnimatedImgLoader from 'react-native-animated-image-loader';
```

## Basic Usage

```js
<AnimatedImgLoader imageUri={'url-to-your-image'} />
```

### Configuration - Props

| Property              |    Type    |                              Default                               | Description                                          |
|-----------------------|:----------:|:------------------------------------------------------------------:|------------------------------------------------------|
| **imageUri**          | **string** |                           **undefined**                            | **Required: the url of the image you want to load**  |
| loaderContainerStyles | ViewStyle  | { borderRadius: 8,width: '90%', height: 250, overflow: 'hidden', } | set your own styles for the loader container wrapper |
| skeletonStyles        | ViewStyle  |         { alignItems: 'center', justifyContent: 'center' }         | set your own styles for the skeleton component       |
| skeletonColor         |   string   |                          "rgba(0,0,0,.2)"                          | set skeleton background color                        |


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
