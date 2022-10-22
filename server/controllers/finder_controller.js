import requestModule from "request";

export const email_finder_request = async (response, name, domain) => {
    var reqBody = {
        name: name,
        domain: domain,
    };
    reqBody = JSON.stringify(reqBody);
    requestModule.post(
    {
        url: "https://api.clearout.io/v2/email_finder/instant",
        body: reqBody,
        headers: {  
            Authorization: process.env.CLEAROUT_API_KEY, // Your API KEY
            "Content-Type": "application/json",
        },
    },
    "post.bin",
    function (err, res) {
        if (err) {
            response.send("Error!");
            return;
        }

        console.log(res.body);
        response.send(res.body);
    }
    );
};
