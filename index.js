#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const _adpcm = require('./adpcm-wasm');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
  .command(['convert', '$0'], 'convert file to adpcm', (yargs) => {
    return yargs
      .option('input', {
        alias: 'i',
        describe: 'the input sound file to convert'
      })
      .option('output', {
        alias: 'o',
        describe: 'output name and location of converted file'
      })
      .demandOption('input')
  }, (argv) => {
    if (!fs.existsSync(argv.input)) {
        console.error(`[Error] Could not find input file: ${argv.input}`);
        return;
    }
    const ffmpeg = createFFmpeg({ log: argv.verbose });

    (async () => {
        const filename = argv.input;
    
        console.log("Converting input to temporary wav...");
        await ffmpeg.load();
        await ffmpeg.FS('writeFile', filename, await fetchFile(`./${filename}`));
        await ffmpeg.run('-i', filename, '-ar', '44100', '.tmp.wav');
        await fs.promises.writeFile('.tmp.wav', ffmpeg.FS('readFile', '.tmp.wav'));
        const adpcm = await _adpcm();
    
        const ptr1 = adpcm.allocateUTF8(".tmp.wav");
        const outFile = (argv.output && !argv.output.includes(".")) ? `${argv.output}.wav` : argv.output;
        if (outFile && outFile.includes("/")) {
            const moo = outFile.split("/")
            moo.pop()
            fs.mkdir(moo.join("/"), { recursive: true }, () => {});
        }

        const ptr2 = adpcm.allocateUTF8(outFile || `${filename.split('.')[0]}.wav`);
        adpcm._convert(ptr1, ptr2);
        adpcm._free(ptr1);
        adpcm._free(ptr2);
    
        fs.unlinkSync('.tmp.wav');
    
        process.exit(0);
    })();
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .alias('h', 'help')
  .version(false)
  .demandCommand(1)
  .parse()
