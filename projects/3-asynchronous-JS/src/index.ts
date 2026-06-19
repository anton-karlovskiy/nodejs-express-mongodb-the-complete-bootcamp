import fs from 'fs';
import superagent from 'superagent';

const readFilePro = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find that file');
      resolve(data.toString());
    });
  });
};

const writeFilePro = (file: string, data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject('Could not write file');
      resolve('success');
    });
  });
};

const getDocPic = async (): Promise<string> => {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    const [res1, res2, res3] = await Promise.all([
      superagent.get(`https://dog.ceo/api/breed/${data}/images/random`),
      superagent.get(`https://dog.ceo/api/breed/${data}/images/random`),
      superagent.get(`https://dog.ceo/api/breed/${data}/images/random`),
    ]);

    const imgs: string[] = [res1, res2, res3].map(
      (r: superagent.Response) => r.body.message as string,
    );
    console.log(imgs);

    await writeFilePro('dog-img.txt', imgs.join('\n'));
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
    const x = await getDocPic();
    console.log(x);
    console.log('3: Done getting dog pics!');
  } catch {
    console.log('ERROR');
  }
})();
