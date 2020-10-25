/**
 * Quick Start
 * 1. Open `omiai` page and login with your credential.
 * 2. Open search page (list page) and set your favorite settings.
 * 3. Open `Developer tools` (F12) in your browser.
 * 4. Select `Console` tab, then copy and paste following script.
 * 5. When you press enter, then the script starts.
 * 
 * Tips
 *  - To confirm that the operation is idling, select `Network` tab.
 *  - It is not recommended to minimize browser (Especially Google Chrome because of behavior of javascript).
 */
$(() => {
    const API_URL = 'https://www.omiai-jp.com/connect/api';
    const LIMIT = 24;
    let cnt = 0;

    let visitUser = (user, referer) => {
        let request = {
            url: API_URL,
            type: 'POST',
            data: {
                apiPath: '/footprint/leave',
                user_id: user.user_id,
                referer: referer
            }
        };
        $.ajax(request).then(data => {
            let result = JSON.parse(data);
            if (result && result.success && result.success == 1) {
                console.log('visit:' + user.nickname);
                cnt++;
            }
        }).catch(e => {
            console.error(e);
        })
        return;
    };

    let search = offset => {
        let request = {
            url: API_URL,
            type: 'POST',
            data: {
                apiPath: '/search/recommend/results',
                apiVersion: 2,
                master: true,
                limit: LIMIT,
                offset: offset,
            }
        };
        $.ajax(request).then(data => {
            result = JSON.parse(data);
            if (result && 'error' in result && 'code' in result.error && result.error.code == 3) {
                alert('Operation Finished. Number of visited users: ' + cnt);
                return;
            }
            if (result.results.length === 0) {
                return;
            }
            let referer = result.footprint_referer;
            while (user = result.results.shift()) {
                visitUser(user, referer);
            }
            search(offset + LIMIT);
        }).catch(e => {
            console.error(e);
            alert('Failed to search users. Operation is interrupted.');
        })
    };

    search(1);
    return;
});