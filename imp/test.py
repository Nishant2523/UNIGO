from sawtooth_signing import create_context
from sawtooth_signing import CryptoFactory
import base64
import json
from hashlib import sha512
import hashlib
from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader
from sawtooth_sdk.protobuf.transaction_pb2 import Transaction
from sawtooth_sdk.protobuf.batch_pb2 import BatchHeader
from sawtooth_sdk.protobuf.batch_pb2 import Batch
from sawtooth_sdk.protobuf.batch_pb2 import BatchList
import urllib.request
from urllib.error import HTTPError


FAMILY_NAME = "naturecommunity"


def _hash(data):
    '''Compute the SHA-512 hash and return the result as hex characters.'''
    return hashlib.sha512(data).hexdigest()

def _get_wallet_address(from_key):
    return _hash(FAMILY_NAME.encode('utf-8'))[0:6] + _hash(from_key.encode('utf-8'))[0:64]

import string
import random
def id_generator(size=6, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

context = create_context('secp256k1')
private_key = context.new_random_private_key()
signer = CryptoFactory(context).new_signer(private_key)


payloadRegister = {
    'action': 'register',
    'data':{
        "email": "lol@lol.vom",
        "profilePicURL": "https;??www.gm.com/j.jpg",
        "password": "secret",
        "phone": "100",
        "name": "bablu jasbati"
    }
}
nounce=id_generator()
timestamp="654646456546"
payloadPost={
    'action': 'post',
    'data':{
        "timestamp": timestamp,
        "profilePicURL": "https;??www.gm.com/j.jpg",
        "password": "secret",
        "phone": "100",
        "name": "bablu jasbati",
        "nounce":nounce
    }
}

publickKey=signer.get_public_key().as_hex()

toKey=_hash(FAMILY_NAME.encode('utf-8'))[0:6]+_hash(timestamp.encode('utf-8'))[0:9]+_hash(publickKey.encode('utf-8'))[0:50]+_hash(nounce.encode('utf-8'))[0:5]

payload=base64.b64encode(json.dumps(payloadPost).encode())



txn_header_bytes = TransactionHeader(
    family_name=FAMILY_NAME,
    family_version='1.0',
    inputs=[toKey],
    outputs=[toKey],
    signer_public_key=signer.get_public_key().as_hex(),
    batcher_public_key=signer.get_public_key().as_hex(),
    dependencies=[],
    payload_sha512=sha512(payload).hexdigest()
).SerializeToString()


signature = signer.sign(txn_header_bytes)

txn = Transaction(
    header=txn_header_bytes,
    header_signature=signature,
    payload=payload
)



batch_header_bytes = BatchHeader(
    signer_public_key=signer.get_public_key().as_hex(),
    transaction_ids=[signature],
).SerializeToString()

signature = signer.sign(batch_header_bytes)

batch = Batch(
    header=batch_header_bytes,
    header_signature=signature,
    transactions=[txn]
)

batch_list_bytes = BatchList(batches=[batch]).SerializeToString()


try:
    request = urllib.request.Request(
        'http://127.0.0.1:8008/batches',
        batch_list_bytes,
        method='POST',
        headers={'Content-Type': 'application/octet-stream'})
    response = urllib.request.urlopen(request)
    print(response.read())
except HTTPError as e:
    response = e.file
