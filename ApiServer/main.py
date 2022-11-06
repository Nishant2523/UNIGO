import os
from flask import Flask
from flask import request
import pymongo
import json
import requests
import base64
from hashlib import sha512
import hashlib
from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
FAMILY_NAME = "naturecommunity"

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
dblist = myclient.list_database_names()

mydb = myclient["hexahive"]
collist = mydb.list_collection_names()
regcol = mydb["users"]

def _hash(data):
    '''Compute the SHA-512 hash and return the result as hex characters.'''
    return hashlib.sha512(data).hexdigest()



@app.route('/')
@cross_origin()
def hello():
    return "Hello World!"

@app.route('/register',methods=['POST'])
@cross_origin()
def registerAccount():
    data=json.loads(list(request.form.to_dict().keys())[0])
    try:
        check = regcol.find_one({"email":data['email']})
        if check:
            return json.dumps({"status": "fail", "message": "User already exsist..."})
        regcol.insert_one(data)
        return json.dumps({"status":"sucess","message":"Registered sucessfully..."})
    except Exception as e:
        print(e)
        return json.dumps({"status": "fail", "message": "Error in registration..."})

@app.route('/login',methods=['POST'])
@cross_origin()
def loginAccount():
    try:
        data = json.loads(list(request.form.to_dict().keys())[0])
        x=regcol.find_one(data)
        if not x:
            return json.dumps({"status": "fail", "message": "Wrong email or password...."})
        x['status']="sucess"
        x['message']='Login sucessfully...'
        del x['_id']
        return json.dumps(x)
    except Exception as e:
        print(e)
        return json.dumps({"status": "fail", "message": "Error while login...."})


@app.route('/getPost',methods=['GET'])
@cross_origin()
def getpost():
    try:
        timestamp = "654646456546"
        address=_hash(FAMILY_NAME.encode('utf-8'))[0:6] + _hash(timestamp.encode('utf-8'))[0:8]
        print(address)
        r=requests.get("http://127.0.0.1:8008/state?address={}".format(address))
        out={"status":"sucess"}
        out['data']=[]
        for x in json.loads(r.text)['data']:
            out['data'].append(json.loads(base64.b64decode(x['data']).decode()))
        return out
    except Exception as e:
        print(e)
        return json.dumps({"status": "fail", "message": "Error while fetching post..."})

@app.route('/batches',methods=['POST'])
@cross_origin()
def submit_batches():
    try:
        data=request.data
        r=requests.post("http://127.0.0.1:8008/batches",data=data,headers={ 'Content-Type': 'application/octet-stream'})
        print(r.text)
        return json.dumps({"status":"sucess","message":"post commited sucessfully to block chain....."})
    except Exception as e:
        print(e)
        return json.dumps({"status":"fail","message":"post commited sucessfully to block chain....."})


if __name__ == '__main__':
    app.run(host="0.0.0.0",port=6060)

