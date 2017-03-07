var files = {};

function dictItems(dictionary) {
    /**
     * Return an array of (key,value) pairs that are present in this
     * dictionary
     */
    let keyValues = [];

    for (let key in dictionary) {
        if (dictionary.hasOwnProperty(key)) {
            keyValues.push([key, dictionary[key]]);
        }
    }

    return keyValues;
}


function dictValues(dictionary) {
    /**
     * Return an array of values that are present in this dictionary
     */
    let values = [];

    for (let key in dictionary) {
        if (dictionary.hasOwnProperty(key)) {
            values.push(dictionary[key]);
        }
    }

    return values;
}

function dictKeys(dictionary) {
    /**
     * Return an array of values that are present in this dictionary
     */
    let keys = [];

    for (let key in dictionary) {
        if (dictionary.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    return keys;
}


function uploadFile(file)  {
    console.log('uploading...', file);

    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:aca0f696-1bc7-4bcb-9a05-c2ba52202e8b',
    });

    console.log('file:', file.name)
    var key = "public/tmp/examples/" + file.name
    var s3 = new AWS.S3();
    var ret = s3.upload({Bucket: "pkerp", Key: key, Body: file });
    console.log('ret:', ret);

    files[key] = {'ret': ret, progress: 0, total: 0};

    ret.on('httpUploadProgress', function(progress) {
        console.log('progress:', progress);

        files[progress.key].progress = progress.loaded;
        files[progress.key].total = progress.total;

        var selection = d3.select('#progress-table')
            .selectAll('tr')
            .data(dictItems(files))

        console.log('selection:', selection);
        
        let enterTr = selection.enter()
            .append('tr')


        enterTr.append('td')
        .classed('filename', true)

        enterTr.append('td')
        .classed('uploaded', true)

        enterTr.append('td')
        .classed('total', true)

        var cancelButton = enterTr.append('td')
        .append('button')
        .classed('cancel-button', true)
        .text('Cancel');

        enterTr.merge(selection);

        var tr = selection;

        tr = d3.select('#progress-table').selectAll('tr')

        tr.select('.cancel-button').on('click', function(d) {
            d[1].ret.abort();
        });
        tr.select('.filename').html(function(d) { return d[0]; });
        tr.select('.uploaded').html(function(d) { 
            return d[1].progress; 
            });
        tr.select('.total').html(function(d) { 
            return d[1].total; 
        });

    });

    ret.send(function(err, data) {
        console.log('err:', err);
        console.log('data:', data);
    });
}

function listFiles(file) {
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:aca0f696-1bc7-4bcb-9a05-c2ba52202e8b',
    });

    var bucket = new AWS.S3({
            params: {
                Bucket: "pkerp"
            }
        });

    bucket.listObjects({
            Prefix: "public/tmp/examples/"

            }, function (err, data) {
                if (err) {
                    document.getElementById('uploaded-files').innerHTML = 'ERROR: ' + err;
            } else {
                var objKeys = "";
                data.Contents.forEach(function (obj) {
                    objKeys += "<li>" + obj.Key + "</li>";
                });
                document.getElementById('uploaded-files').innerHTML = "<ul>" +  objKeys + "</ul>";
        }
    });
}

function deleteFiles(file) {
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:aca0f696-1bc7-4bcb-9a05-c2ba52202e8b',
    });

    var bucket = new AWS.S3({
            params: {
                Bucket: "pkerp"
            }
        });

    bucket.listObjects({
            Prefix: "public/tmp/examples/"

            }, function (err, data) {
                console.log('data:', data, 'err:', err);
                if (err) {
                    document.getElementById('uploaded-files').innerHTML = 'ERROR: ' + err;
            } else {
                var objKeys = "";
                data.Contents.forEach(function (obj) {
                    console.log('obj:', obj, obj.Key);
                    bucket.deleteObject({
                        Bucket: 'pkerp',
                        Key: obj.Key
                    }, function(err, data) {
                        console.log('err:', err)    ;
                    });
                });
        }
    });
}
