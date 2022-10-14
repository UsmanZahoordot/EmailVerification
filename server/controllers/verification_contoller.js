import http from 'http';
import requestModule from 'request'
import querystring from 'querystring';

export class Verification_Controller {

    klean_api_request(email){
        var reqBody = {
            "record": email,
        };
        reqBody = JSON.stringify(reqBody);
        requestModule.post({
            url: 'https://api.kleanmail.com/record_verification/api_record',
            body: reqBody,
            headers: {
                'api_key': 'api_key::_p3Uph0tJv2vImXR%2BaNJ5GSiVqz2Ne0zCookA3tqZMK0%3D', // Your API KEY
                'Content-Type': 'application/json'
            }
        }, 'post.bin', function (err, res) {
            if (err) {
                console.error(err);
                return;
            }
            
            console.log(res.body);
        });

    }
}
