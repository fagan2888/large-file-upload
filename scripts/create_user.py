from __future__ import print_function
import json, boto3
import slugid
import sys

client = boto3.client('iam')

# Create Policy
policy = { 'Version' : '2012-10-17'}
policy['Statement'] = [{
            "Sid": "Stmt1421341195000",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:PutObjectVersionAcl"
            ],
            "Resource": [
                "arn:aws:s3:::pkerp/public/tmp/test.txt"
            ]
        }]
policy_json = json.dumps(policy, indent=2)

policy_name=slugid.nice()

response = client.create_policy(PolicyName=policy_name,
                     PolicyDocument=policy_json)
print('create policy response:', response)

if 'Arn' in response['Policy']:
    policy_arn = response['Policy']['Arn']

response = client.delete_policy(PolicyArn=policy_arn)
print('delete policy response:', response)


username = slugid.nice()
response = client.create_user(UserName=username)
# Create user
print("create response:", response)


client.attach_policy

response = client.delete_user(UserName=username)
print("delete response:", response)

