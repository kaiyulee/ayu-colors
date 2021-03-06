import fs from 'fs'
import { resolve } from 'path'
import { spawn } from 'child_process'

import camelcaseKeys from 'camelcase-keys'
import isObject from 'is-object'
import mapObject from 'map-obj'
import rimraf from 'rimraf'
import yaml from 'js-yaml'


const license = `
/**
 * MIT License
 *
 * Copyright (c) 2016 Ike Ku
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
`

const hashtagColors = (obj) => mapObject(obj, (key, value) => {
	if (value.length === 6) {
		return [key, `#${value.toLowerCase()}`]
	}

	return [key, value]
}, { deep: true })

const template = (colors) => `
${license}

export default ${JSON.stringify(hashtagColors(camelcaseKeys(colors, { deep: true })), null, '\t')}
`

const clone = spawn('git', ['clone', 'https://github.com/dempfi/ayu'])

clone.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`)
})

clone.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`)
})

clone.on('close', (code) => {
	if (code !== 0) {
		console.log('error')
		return false
	}

	const darkYAML = fs.readFileSync(resolve('ayu/src/themes/dark.yml'), 'utf8')
	const lightYAML = fs.readFileSync(resolve('ayu/src/themes/light.yml'), 'utf8')
	const mirageYAML = fs.readFileSync(resolve('ayu/src/themes/mirage.yml'), 'utf8')

	const dark = yaml.safeLoad(darkYAML)
	const light = yaml.safeLoad(lightYAML)
	const mirage = yaml.safeLoad(mirageYAML)

	const darkJS = template(dark)
	const lightJS = template(light)
	const mirageJS = template(mirage)

	fs.writeFileSync(resolve('src/dark.js'), darkJS)
	fs.writeFileSync(resolve('src/light.js'), lightJS)
	fs.writeFileSync(resolve('src/mirage.js'), mirageJS)
})
