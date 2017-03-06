function upload_file(file)  {
    console.log('uploading...', file);

    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:aca0f696-1bc7-4bcb-9a05-c2ba52202e8b',
    });

    var s3 = new AWS.S3();
    var ret = s3.upload({Bucket: "pkerp", Key: "public/tmp/test.txt", Body: file });
    console.log('ret:', ret);

    ret.send();
}
