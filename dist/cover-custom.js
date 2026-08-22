(function () {
  'use strict';
  if (window.__lycheeSetCoverLoaded) return;
  window.__lycheeSetCoverLoaded = true;

  var STYLE_ID = 'lychee-custom-cover-style';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#lychee_cover_modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: rgba(0,0,0,.85); display: flex; flex-direction: column; }',
      '#lychee_cover_modal .lcm-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; color: #fff; background: rgba(0,0,0,.4); font-size: 15px; }',
      '#lychee_cover_modal .lcm-close { cursor: pointer; font-size: 24px; padding: 2px 12px; border-radius: 4px; }',
      '#lychee_cover_modal .lcm-close:hover { background: rgba(255,255,255,.2); }',
      '#lychee_cover_modal .lcm-grid { flex: 1; overflow: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 20px; }',
      '#lychee_cover_modal .lcm-item { position: relative; cursor: pointer; border-radius: 8px; overflow: hidden; background: #222; aspect-ratio: 1; }',
      '#lychee_cover_modal .lcm-item img { width: 100%; height: 100%; object-fit: cover; display: block; }',
      '#lychee_cover_modal .lcm-item:hover { outline: 3px solid #4c8bf5; }',
      '#lychee_cover_modal .lcm-status { padding: 10px 20px; color: #ffe; background: rgba(0,0,0,.4); text-align: center; font-size: 14px; }',
      '#lychee_cover_modal .lcm-empty { color: #fff; padding: 20px; grid-column: 1 / -1; }',
      '#lychee_footer .home_copyright { display: none !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function currentAlbumID() {
    var h = location.hash || '';
    return h.length > 1 ? h.replace(/^#/, '') : null;
  }

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : '';
  }

  function api(path, body) {
    var xsrf = getCookie('XSRF-TOKEN');
    var headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (xsrf) { headers['X-XSRF-TOKEN'] = xsrf; }
    return fetch('/api/' + path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: headers,
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return null; });
    });
  }

  function photoThumb(p) {
    var sv = p.size_variants || {};
    return (sv.thumb && sv.thumb.url) || (sv.small && sv.small.url) || (sv.original && sv.original.url) || '';
  }

  // 递归收集相册树中所有相册 ID
  function collectAlbumIds(node, acc) {
    var albums = node.albums || [];
    albums.forEach(function (a) {
      acc.push(a.id);
      collectAlbumIds(a, acc);
    });
    return acc;
  }

  // 获取所有照片：遍历相册树 → 每个相册 Album::get
  function fetchAllPhotos() {
    return api('Albums::tree', {}).then(function (tree) {
      var albumIds = [];
      ((tree && tree.albums) || []).forEach(function (a) {
        albumIds.push(a.id);
        collectAlbumIds(a, albumIds);
      });
      ((tree && tree.shared_albums) || []).forEach(function (a) {
        albumIds.push(a.id);
        collectAlbumIds(a, albumIds);
      });
      var unique = albumIds.filter(function (v, i) { return albumIds.indexOf(v) === i; });
      return Promise.all(unique.map(function (id) {
        return api('Album::get', { albumID: id }).then(function (d) {
          return (d && d.photos) || [];
        }).catch(function () { return []; });
      })).then(function (groups) {
        var all = [];
        groups.forEach(function (g) { all = all.concat(g); });
        return all;
      });
    });
  }

  function openPanel() {
    var albumID = currentAlbumID();
    if (!albumID) { alert('请先进入一个相册，再设置封面'); return; }

    var modal = document.createElement('div');
    modal.id = 'lychee_cover_modal';
    modal.innerHTML = [
      '<div class="lcm-header">',
      '<div>选择封面图片（当前相册：' + albumID + '）</div>',
      '<div class="lcm-close">✕</div>',
      '</div>',
      '<div class="lcm-grid"><div class="lcm-empty">加载中…</div></div>',
      '<div class="lcm-status"></div>'
    ].join('');
    document.body.appendChild(modal);

    var grid = modal.querySelector('.lcm-grid');
    var status = modal.querySelector('.lcm-status');
    modal.querySelector('.lcm-close').addEventListener('click', function () { modal.remove(); });

    fetchAllPhotos().then(function (photos) {
      grid.innerHTML = '';
      if (!photos.length) {
        grid.innerHTML = '<div class="lcm-empty">没有找到照片</div>';
        return;
      }
      photos.forEach(function (p) {
        var url = photoThumb(p);
        var item = document.createElement('div');
        item.className = 'lcm-item';
        item.title = (p.title || '') + ' (' + p.id + ')';
        if (url) {
          var img = document.createElement('img');
          img.src = url;
          img.alt = p.title || '';
          item.appendChild(img);
        } else {
          item.textContent = p.title || p.id;
        }
        item.addEventListener('click', function () {
          status.textContent = '正在设置封面…';
          api('Album::setCover', { albumID: albumID, photoID: p.id }).then(function () {
            status.textContent = '封面已设置，即将刷新';
            setTimeout(function () { location.reload(); }, 800);
          }).catch(function () {
            status.textContent = '设置失败，请重试';
          });
        });
        grid.appendChild(item);
      });
    }).catch(function () {
      grid.innerHTML = '<div class="lcm-empty">加载照片失败，请确认已登录</div>';
    });
  }

  // 隐藏页脚品牌/版权文字（CSS + JS 双保险）
  function hideFooterBranding() {
    var els = document.querySelectorAll('.home_copyright, .hosted_by');
    els.forEach(function (el) { el.style.display = 'none'; });
  }
  document.addEventListener('DOMContentLoaded', hideFooterBranding);
  hideFooterBranding();
  setInterval(hideFooterBranding, 2000);

  function waitForButton() {
    var btn = document.getElementById('button_set_cover_custom');
    if (btn) {
      if (!btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', openPanel);
      }
      return;
    }
    setTimeout(waitForButton, 500);
  }
  waitForButton();
})();
