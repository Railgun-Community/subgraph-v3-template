import { Bytes } from '@graphprotocol/graph-ts';
import { padTo32BytesStart, strip0x } from './utils';

const getPaddedCiphertextIvTag = (ciphertext: Bytes[]): string => {
  const ivTag32Bytes = padTo32BytesStart(ciphertext[0]);
  const ivTag = strip0x(ivTag32Bytes);
  return ivTag;
};

export const getCiphertextIV = (ciphertext: Bytes[]): Bytes => {
  const ivTag = getPaddedCiphertextIvTag(ciphertext);
  const iv = Bytes.fromHexString(ivTag.substring(0, 32));
  return iv;
};

export const getCiphertextTag = (ciphertext: Bytes[]): Bytes => {
  const ivTag = getPaddedCiphertextIvTag(ciphertext);
  const tag = Bytes.fromHexString(ivTag.substring(32));
  return tag;
};

export const getCiphertextData = (ciphertext: Bytes[]): Bytes[] => {
  const data = ciphertext.slice(1).map<Bytes>((dataField) => {
    return padTo32BytesStart(dataField);
  });
  return data;
};
