import Emitter from 'licia/Emitter'
import trim from 'licia/trim'
import isEmpty from 'licia/isEmpty'
import map from 'licia/map'
import escape from 'licia/escape'
import { classPrefix as c } from '../lib/util'

export default class Detail extends Emitter {
  constructor($container) {
    super()
    this._$container = $container

    this._detailData = {}
    this._bindEvent()
  }
  show(data) {
    if (data.resTxt && trim(data.resTxt) === '') {
      delete data.resTxt
    }
    if (isEmpty(data.resHeaders)) {
      delete data.resHeaders
    }
    if (isEmpty(data.reqHeaders)) {
      delete data.reqHeaders
    }

    let postData = ''
    if (data.data) {
      postData = `<pre class="${c('data')}">${escape(data.data)}</pre>`
    }

    let reqHeaders = '<tr><td>Empty</td></tr>'
    if (data.reqHeaders) {
      reqHeaders = map(data.reqHeaders, (val, key) => {
        return `<tr>
          <td class="${c('key')}">${escape(key)}</td>
          <td>${escape(val)}</td>
        </tr>`
      }).join('')
    }

    let resHeaders = '<tr><td>Empty</td></tr>'
    if (data.resHeaders) {
      resHeaders = map(data.resHeaders, (val, key) => {
        return `<tr>
          <td class="${c('key')}">${escape(key)}</td>
          <td>${escape(val)}</td>
        </tr>`
      }).join('')
    }

    let resTxt = ''
    if (data.resTxt) {
      resTxt = `<pre class="${c('response')}">${escape(data.resTxt)}</pre>`
    }

    const html = `<div class="${c('http')}">
      <div class="${c('breadcrumb')}">${escape(data.url)}</div>
      ${postData}
      <div class="${c('section')}">
        <h2>Request Headers</h2>
        <table class="${c('headers')}">
          <tbody>
            ${reqHeaders}
          </tbody>
        </table>
      </div>
      <div class="${c('section')}">
        <h2>Response Headers</h2>
        <table class="${c('headers')}">
          <tbody>
            ${resHeaders}
          </tbody>
        </table>
      </div>
      ${resTxt}
    </div>
    <div class="${c('back')}">Back to the List</div>`

    this._$container.html(html).show()
    this._detailData = data
  }
  hide() {
    this._$container.hide()
  }
  _bindEvent() {
    this._$container
      .on('click', c('.back'), () => this.hide())
      .on('click', c('.http .response'), () => {
        const data = this._detailData
        const resTxt = data.resTxt

        switch (data.subType) {
          case 'css':
            return showSources('css', resTxt)
          case 'html':
            return showSources('html', resTxt)
          case 'javascript':
            return showSources('js', resTxt)
          case 'json':
            return showSources('object', resTxt)
        }
        switch (data.type) {
          case 'image':
            return showSources('img', data.url)
        }
      })

    const showSources = (type, data) => {
      this.emit('showSources', type, data)
    }
  }
}
