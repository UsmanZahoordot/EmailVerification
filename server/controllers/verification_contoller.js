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

    clearout_email_verification(email){
        var reqBody = {
            'email' : email,
        };
        reqBody = JSON.stringify(reqBody);
        requestModule.post({
            url: 'https://api.clearout.io/v2/email_verify/instant',
            body: reqBody,
            headers: {
                'Authorization': '4f7ffafafa447cdef751ffb037c91a8a:57ecb252d2f92600ca1132308a0ce486aac7a379cd7dc819af804145e98d7682', // Your API KEY
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
