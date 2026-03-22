import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadImageToIPFS = async (file) => {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is missing in the environment variables');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${PINATA_JWT}`
      }
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw new Error(error.response?.data?.error?.details || 'Failed to upload image to IPFS');
  }
};

export const uploadMetadataToIPFS = async (name, description, imageCID) => {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is missing in the environment variables');
  }

  const metadata = {
    name,
    description,
    image: `ipfs://${imageCID}`
  };

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      pinataContent: metadata,
      pinataMetadata: {
        name: `${name} Metadata`
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`
      }
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error(error.response?.data?.error?.details || 'Failed to upload metadata to IPFS');
  }
};
