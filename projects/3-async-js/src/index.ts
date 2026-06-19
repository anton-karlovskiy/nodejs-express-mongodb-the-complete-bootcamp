import fs from 'fs';
import superagent from 'superagent';

const readFileAsync = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find that file');
      resolve(data.toString());
    });
  });
};

const writeFileAsync = (file: string, data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject('Could not write file');
      resolve('success');
    });
  });
};

const getDogPics = async (): Promise<string> => {
  try {
    const breed = await readFileAsync(`${__dirname}/dog.txt`);
    console.log(`Breed: ${breed}`);

    const responses = await Promise.all([
      superagent.get(`https://dog.ceo/api/breed/${breed}/images/random`),
      superagent.get(`https://dog.ceo/api/breed/${breed}/images/random`),
      superagent.get(`https://dog.ceo/api/breed/${breed}/images/random`),
    ]);

    const imageUrls: string[] = responses.map(
      (response: superagent.Response) => response.body.message as string,
    );
    console.log(imageUrls);

    await writeFileAsync('dog-img.txt', imageUrls.join('\n'));
    console.log('Random dog image saved to file!');
  } catch (err) {
    console.log(err);
    throw err;
  }
  return '2: READY';
};

(async () => {
  try {
    console.log('1: Will get dog pics!');
    const result = await getDogPics();
    console.log(result);
    console.log('3: Done getting dog pics!');
  } catch {
    console.log('ERROR');
  }
})();
