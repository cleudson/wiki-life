# Wiki-life

An experiment that scrapes into an url in Wikipedia that contains a table of taxonomy.

```bash
npm install
node index.js
```
Terminal will ask for the url and if you want to save into a json file. Otherwise, shows the content.

## Exmaple

Link: https://en.wikipedia.org/wiki/Aye-aye

Result:

```js
{
  "name": {
    "vulgar": "Aye-aye",
    "synonyms": [
      [
        "Family",
        [
          "Cheiromyidae I. Geoffroy St. Hilaire, 1851",
          "Chiromyidae Bonaparte, 1850"
        ]
      ],
      [
        "Genus",
        [
          "Aye-aye Lacépède, 1799",
          "Cheiromys G. Cuvier, 1817",
          "Cheyromys É. Geoffroy, 1803",
          "Chiromys Illiger, 1811",
          "Myslemur Anon. , 1846",
          "Myspithecus de Blainville, 1839",
          "Psilodactylus Oken, 1816",
          "Scolecophagus É. Geoffroy, 1795"
        ]
      ],
      [
        "Species",
        [
          "daubentonii Shaw, 1800",
          "laniger G. Grandidier, 1930",
          "psilodactylus Schreber, 1800"
        ]
      ]
    ],
    "scientific": "Daubentonia madagascariensis"
  },
  "taxonomy": {
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Primates",
    "suborder": "Strepsirrhini",
    "superfamily": "Lemuroidea",
    "family": "Daubentoniidae"
  },
  "source": "https://en.wikipedia.org/wiki/Aye-aye",
  "conservation": "Endangered"
}
```