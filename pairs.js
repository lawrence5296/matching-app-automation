/**
 * Quick Start
 * 1. Open `pairs` page and login with your credential.
 * 2. Open search page and set your favorite settings.
 * 3. Open `Developer tools` (enter F12) in your browser.
 * 4. Select `Console` tab, then copy and paste following script, 
 * 5. When your press enter, then the script start.
 * 
 * Tips
 *  - To confirm that the operation is idling, select `Network` tab.
 *  - It is not recommended to minimize browser (Especially Google Chrome because of behavior of javascript).
 */
const BASE_URI = 'https://pairs.lv';
const SEARCH_URI = BASE_URI + '/2.0/search/layout';
const VISIT_URI = BASE_URI + '/1.0/visitor'
const GIT_VERSION = 'git-xxxxxxxx-v20190101123456';
const LIMIT = 3;
const DEVICE = 'pc';

let extractToken = () => {
    let cookies = document.cookie;
    for (var c of cookies.split(';')) {
        let content = c.split('=');
        if (content[0].includes('pairs_token')) {
            return content[1];
        }
    }
    return;
}

let cnt = 0;
let token = extractToken();

let createSearchUrl = (offset, limit, randSeed) => {
    return SEARCH_URI
        + '?offset=' + offset
        + '&limit=' + limit
        + '&device=' + DEVICE
        + '&version=' + GIT_VERSION
        + '&rand_seed=' + randSeed
        + '&sort_id=' + '0'
        + '&is_mock=' + '0';
}

let extractUserData = (resp) => {
    if (!resp.layouts) {
        return;
    }
    for (let layout of resp.layouts) {
        if (layout.chunk) {
            return layout.chunk.items;
        }
    }
    return;
}

let visitUser = (token, user) => {
    if (!user.partner) {
        return;
    }
    let xhr = new XMLHttpRequest();
    let url = VISIT_URI + '/' + user.partner.id;
    xhr.open('POST', url, true);
    xhr.setRequestHeader('pairs-token', token);
    xhr.onload = e => {
        console.log('visit:' + user.partner.nickname)
        cnt++;
    }
    xhr.onerror = e => {
        console.error(JSON.parse(xhr.responseText));
    }
    xhr.send(JSON.stringify({ device: DEVICE, version: GIT_VERSION }));
    return;
}

let search = (token, offset, randSeed) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', createSearchUrl(offset, LIMIT, randSeed), true);
    xhr.setRequestHeader('pairs-token', token);
    xhr.onload = e => {
        data = JSON.parse(xhr.responseText)
        users = extractUserData(data);
        if (!users || users.length == 0) {
            alert('Operation Finished. Number of visited users: ' + cnt)
            return;
        }
        for (let user of users) {
            visitUser(token, user);
        }
        search(token, offset + LIMIT, data.rand_seed);
    }
    xhr.onerror = e => {
        console.error(JSON.parse(xhr.responseText));
    }
    xhr.send(null);
    return;
}

search(token, 0, 0);