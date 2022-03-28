## adpcm-converter

Simple cli tool for converting (most) sound files into [`ADPCM`](https://en.wikipedia.org/wiki/Adaptive_differential_pulse-code_modulation) encoded wav files.

## Installation
```
npm install adpcm-converter -g
```

## Usage
Outputs an 'example.wav' in the same folder.
```sh
$ adpcm-converter -i example.mp3
```
or you can choose where to place the output
```sh
$ adpcm-converter -i example.mp3 -o Sources/sounds/example.wav
```