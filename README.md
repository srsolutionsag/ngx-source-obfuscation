# ngx-source-obfuscation

Angular Builder CLI which integrates the javascript-obfuscation project into angular.

## Getting Started

### Prerequisites
* Package manager like yarn or npm
* Angular 8.

### Installing

#### Yarn
```
yarn add -D @srag/@srag/ngx-source-obfuscation
```

#### Npm
```
npm i -D @srag/@srag/ngx-source-obfuscation
```

#### Angular Setup
Create a target in your `angular.json` file. Like the one shown bellow.
Other targets like `lint` or `build` are located in the same place.

*Important* make sure your level of obfuscation and performance is suitable for your
project! The *default* parameters are must likely *not* what you *want*. 

```json
"obfuscate": {
        "builder": "@srag/ngx-source-obfuscation:obfuscate",
        "options": {
            "files": [
                {
                    "glob": "main*.js",
                    "input": "www",
                    "output": "www"
                }
            ],
            "sourceMap": true,
            "sourceMapMode":"separate"
        },
        "configurations": {
            "production": {
                "debugProtection": true,
                "debugProtectionInterval": true,
                "sourceMap": false
            }
        }
    }
```

A Live Demo of the obfuscation library <https://obfuscator.io/> provided by the author of the library.
A list of available configuration options can be found [here](https://github.com/javascript-obfuscator/javascript-obfuscator)

#### Running the task
##### General
The angular cli target can be invoked like every other target `<project>:<target>:<configuration>`.
##### Examples
###### Yarn
"Dev Build"
```
yarn ng run app:obfuscate
```

Prod Build
```
yarn ng run app:obfuscate:production
```

###### Npm
"Dev Build"
```
npx ng run app:obfuscate
```

Prod Build
```
npx ng run app:obfuscate:production
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Angular-Devkti](https://www.npmjs.com/package/@angular-devkit/architect) - Used to create the builder.
* [Yarn](https://classic.yarnpkg.com/) - Dependency Management
* [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) - The library which does all the work.
* [multi-stage-sourcemap](https://github.com/azu/multi-stage-sourcemap) - Used to merge the source maps of Angular build output and javascript-obfuscator.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Nicolas Schäfli** - *Initial work* - [d3r1w](https://github.com/d3r1w)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## Acknowledgments

* Huge thanks to Timofey Kachalov, contributers and supporters of the [javascript-obfuscator](https://obfuscator.io) project.

## License

This project is licensed under the GPL-v3 License - see the [LICENSE.md](LICENSE.md) file for details

@srag/ngx-source-obfuscation Copyright (C) 2020 studer-raimann.ch

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

