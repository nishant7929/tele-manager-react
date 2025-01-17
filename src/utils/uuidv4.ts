/* eslint-disable */
// ----------------------------------------------------------------------

export default function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const uuidv4V2 = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let randomID = '';

    for (let i = 0; i < 20; i++) {
        const useUppercase = Math.random() < 0.25;
        const characterSet = useUppercase ? uppercaseChars : lowercaseChars + numbers;

        const randomIndex = Math.floor(Math.random() * characterSet.length);
        randomID += characterSet.charAt(randomIndex);
    }
    return randomID;
};
