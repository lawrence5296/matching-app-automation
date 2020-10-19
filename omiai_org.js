/**
 * omiai にログインした状態でこのスクリプトを実行する
 *
 * e.g. Google Chrome
 *      1. 開発者ウィンドウを開く (Command + Option + i)
 *      2. Console タブを選択
 *      3. このスクリプトを Copy & Paste して Return キーを入力
 *      動作確認
 *      * Network タブを選択して、リクエストが増えていたら動作している
 *
 * 条件を指定する場合は omiai のサイト上の検索条件を指定した状態で
 * このスクリプトを実行する
 */
$(() => {
    const API_URL = 'https://www.omiai-jp.com/connect/api';
    const INTERVAL_TIME = 300;
    const LIMIT = 100;
    const MAXIMUM_ERROR = 10;
    let errorCount = 0;
    let start = () => {
        console.log('検索を開始します');
        search(1);
        return;
    };
    let detail = userId => {
        let request = {
            url: API_URL,
            type: 'POST',
            data: {
                apiPath: '/member/detail',
                apiVersion: 2,
                master: true,
                to_user_id: userId
            }
        };
        $.ajax(request);
        return;
    };
    let footprint = (userId, referer) => {
        let request = {
            url: API_URL,
            type: 'POST',
            data: {
                apiPath: '/footprint/leave',
                user_id: userId,
                referer: referer
            }
        };
        $.ajax(request).done(data => {
            let result = JSON.parse(data);
            if ('success' in result && result.success != 1) {
                ++errorCount;
            }
        }).fail(data => {
            ++errorCount;
            return;
        });
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
        $.ajax(request).done(data => {
            let result = JSON.parse(data);
            if (result && 'footprint_referer' in result && 'number' in result && $.isArray(result.results)) {
                if (result.results.length === 0) {
                    alert('検索結果がありませんでした');
                } else {
                    let referer = result.footprint_referer;
                    let number = result.number;
                    let next = () => {
                        if (MAXIMUM_ERROR <= errorCount) {
                            alert('エラー許容上限を超えました');
                            errorCount = 0;
                            return;
                        }
                        setTimeout(() => {
                            let user = result.results.shift();
                            if (user) {
                                detail(user.user_id);
                                footprint(user.user_id, referer);
                                next();
                            } else if (number < offset + LIMIT){
                                console.log('全ての検索結果に足跡をつけました');
                                start();
                            } else {
                                search(offset + LIMIT);
                            }
                            return;
                        }, INTERVAL_TIME);
                        return;
                    };
                    next();
                }
            } else if (result && 'error' in result && 'code' in result.error && result.error.code == 3) {
                console.log('全ての検索結果に足跡をつけました');
                start(0);
            } else {
                alert('検索でエラーが発生しました');
            }
            return;
        }).fail(data => {
            alert('通信エラーが発生しました');
            return;
        });
        return;
    };
    start();
    return;
});