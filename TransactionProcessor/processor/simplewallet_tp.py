# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------
'''
Transaction family class for simplewallet.
'''

import traceback
import sys
import hashlib
import logging
import base64
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.exceptions import InternalError
from sawtooth_sdk.processor.core import TransactionProcessor
import json

LOGGER = logging.getLogger(__name__)

FAMILY_NAME = "naturecommunity"

def _hash(data):
    '''Compute the SHA-512 hash and return the result as hex characters.'''
    return hashlib.sha512(data).hexdigest()

# Prefix for simplewallet is the first six hex digits of SHA-512(TF name).
sw_namespace = _hash(FAMILY_NAME.encode('utf-8'))[0:6]

class SimpleWalletTransactionHandler(TransactionHandler):
    '''                                                       
    Transaction Processor class for the simplewallet transaction family.       
                                                              
    This with the validator using the accept/get/set functions.
    It implements functions to deposit, withdraw, and transfer money.
    '''

    def __init__(self, namespace_prefix):
        self._namespace_prefix = namespace_prefix

    @property
    def family_name(self):
        return FAMILY_NAME

    @property
    def family_versions(self):
        return ['1.0']

    @property
    def namespaces(self):
        return [self._namespace_prefix]

    def apply(self, transaction, context):
        '''This implements the apply function for this transaction handler.
                                                              
           This function does most of the work for this class by processing
           a single transaction for the simplewallet transaction family.   
        '''
        # Get the payload and extract simplewallet-specific information.
        try:
            header = transaction.header
            publicKey=header.signer_public_key
            toKey=self._get_wallet_address(publicKey)
            payload = transaction.payload.decode()
            payload_json=json.loads(base64.b64decode(payload).decode())
            action=payload_json['action']
            payloadData=payload_json['data']
            if action=="register":
                self.register(context,toKey,payloadData)
            elif action=="post":
                timestamp=payloadData['timestamp']
                nounce=payloadData['nounce']
                payloadData['publicKey']=publicKey
                toKey=_hash(FAMILY_NAME.encode('utf-8'))[0:6]+_hash(timestamp.encode('utf-8'))[0:9]+_hash(publicKey.encode('utf-8'))[0:50]+_hash(nounce.encode('utf-8'))[0:5]
                self.post(context,toKey,payloadData)
            else:
                raise InvalidTransaction("No action found......")

        except Exception as e:
            print("Error!:",e)
            raise InvalidTransaction("Error occured in transaction.....")


    def register(self,context,toKey,data):


        try:
            current_entry = context.get_state([toKey])
            if current_entry==[]:
                context.set_state({toKey: json.dumps(data).encode()})
                print("Register sucessfully....")
            else:
                print("User already exsist....")
                raise InvalidTransaction("User already exisist....")
        except Exception as e:
            print("Error in register:",e)
            raise InvalidTransaction("Registration failed....")

    def post(self,context,toKey,data):
        context.set_state({toKey: json.dumps(data).encode()})
        print("post sucessfully....")

    def _get_wallet_address(self, from_key):
        return _hash(FAMILY_NAME.encode('utf-8'))[0:6] + _hash(from_key.encode('utf-8'))[0:64]

def setup_loggers():
    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)

def main():
    '''Entry-point function for the simplewallet transaction processor.'''
    setup_loggers()
    try:
        # Register the transaction handler and start it.
        processor = TransactionProcessor(url='tcp://127.0.0.1:4004')

        handler = SimpleWalletTransactionHandler(sw_namespace)

        processor.add_handler(handler)

        processor.start()

    except KeyboardInterrupt:
        pass
    except SystemExit as err:
        raise err
    except BaseException as err:
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

