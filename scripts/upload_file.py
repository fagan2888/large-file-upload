#!/usr/bin/python
from __future__ import print_function

import boto3
import hashlib
import sys
import argparse
import os
import sys
import threading

import botocore
import boto3

def md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

class ProgressPercentage(object):
    def __init__(self, filename):
        self._filename = filename
        self._size = float(os.path.getsize(filename))
        self._seen_so_far = 0
        self._lock = threading.Lock()
    def __call__(self, bytes_amount):
        # To simplify we'll assume this is hooked up
        # to a single filename.
        with self._lock:
            self._seen_so_far += bytes_amount
            percentage = (self._seen_so_far / self._size) * 100
            sys.stdout.write(
                "\r%s  %s / %s  (%.2f%%)" % (
                    self._filename, self._seen_so_far, self._size,
                    percentage))
            sys.stdout.flush()

def main():
    parser = argparse.ArgumentParser(description="""
    
    python upload_file.py filename endpoint

    Example:

    python scripts/upload_file.py test/data/tiny.txt somesite.com/endpoint
""")


    parser.add_argument('filename')
    parser.add_argument('endpoint')
    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    bucket = 'pkerp'
    object_key = 'public/tmp/test.txt'

    args = parser.parse_args()

    print("Calculating md5...", file=sys.stderr)
    file_md5 = md5(args.filename)
    print("Calculated md5: ", file_md5, file=sys.stderr)

    # upload the file
    s3 = boto3.client('s3')
    ret = s3.upload_file(args.filename, bucket, object_key,
            Callback=ProgressPercentage(args.filename))

    # Clear progress percentages
    print("\n")

    # Make sure the object was succesfully uploaded
    try:
        ret = s3.head_object(Bucket=bucket, Key=object_key)
    except botocore.exceptions.ClientError as e:
        #if e.response['Error']['Code'] == "404":
        print("Error accessing the uploaded object")


    
if __name__ == '__main__':
    main()


