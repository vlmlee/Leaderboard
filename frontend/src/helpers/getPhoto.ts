// https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=Jeff%20Bezos
import deepFind from './deepFind';

async function getPhoto(name: string) {
    const response = await fetch(
        'https://en.wikipedia.org/w/api.php?action=query&prop=info|extracts|pageimages|images&inprop=url&format=json&piprop=original&origin=*&titles=' +
            name,
        {
            method: 'GET',
            mode: 'cors'
        }
    );
    const json = await response.json();
    return deepFind(json, 'source')[0];
}

export default getPhoto;
