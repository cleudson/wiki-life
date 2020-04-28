const scrapeIt = require('scrape-it');
const fs = require('fs');
const htmlEntities = require('html-entities').AllHtmlEntities;
const entities = new htmlEntities();

const classificationRule = /(.*):(.*)/;
const footNotes = /\[.*\]/g;
const lineBreaks= /\n/g;
const parenthesis = /\(.*\)/g;
const sentence = /[\.|\s]$/g;
const htmlBreaks = /<br>/g;
const scapehtmlBreaks = /(?!<br>)<[^>]*>/g;
const textAfterhtmlBreaks = /<br>.*/g;

const tabularOrder = ['Conservation status', 'Scientific classification', 'Binomial name', 'Synonyms'];
const getInterval = (info, name, numberOfLines) =>{
    const tabularPosition = tabularOrder.indexOf(name);
    if(tabularPosition === -1) return [];
    const infoStartIndex = info.indexOf(name);
    if(infoStartIndex === -1) return '';
    if(numberOfLines === 1){
        return info[infoStartIndex + 1] || '';
    }
    const nextTopic = tabularOrder[tabularPosition + 1] || '';
    const infoNextTopicIndex = info.indexOf(nextTopic);
    const rangeBylines =  numberOfLines > 1 ? (infoStartIndex + numberOfLines) : null;
    const infoFinalIndex = rangeBylines || (infoNextTopicIndex !== -1 ? infoNextTopicIndex : info.length);
    return info.slice(infoStartIndex + 1, infoFinalIndex);    
}

const getTaxonomy = info =>{
    const targetValue = 
        getInterval(info, 'Scientific classification')
        .join('-')
        .replace(/:-/g, ':')
        .replace(textAfterhtmlBreaks, '')
        .split('-')
    const classification = targetValue
    .filter(el => {
        return classificationRule.test(el);
    })
    .map(el => el.removeLineBreaks())
    .reduce ((acc, curr) => {
        const match = curr.match(classificationRule);
        const key = match[1].toLowerCase();
        const value = match[2];
        acc[key] = value;
        return acc;
    }, {});
    return classification;
}

const getName = info => formatData(info[0]);

const getConservation = info => {
    const conservation = getInterval(info, 'Conservation status', 1);
    if(conservation.indexOf('CITES') > -1){
        return '';
    }
    return conservation.cleanString(htmlBreaks);
}
const getSynonyms = info => {
    const synonyms= getInterval(info, 'Synonyms');
    if(synonyms == false) return [];
    const hasDivisions = synonyms.some(el => el.indexOf(':') !== -1);
    const normalizeSynonyms = (data) => {
        return data
        .map(el => formatData(el))
        .map(el => el.removeLineBreaks());
    }
    if(hasDivisions){
        let currentKey;
        const GroupedSynonyms = synonyms.reduce((acc, curr) => {
            if(curr.indexOf(':') !== -1){
                currentKey = curr.replace(':', '');
                acc[currentKey] = [];
            }
            else{
                acc[currentKey].push(curr);
            }
            return acc;
        },{});
        return Object.entries(GroupedSynonyms)
            .map(el => {
                const element = Object.assign([], el);
                const subElements = normalizeSynonyms(el[1]);
                element[1] = subElements
                return element;
            });
    }
    else{
        return normalizeSynonyms(synonyms)
    }
}

const normalizeData = data => data.map(el => formatData(el));

String.prototype.stringFromTo = function(arr, rule){
    const rules = Array.isArray(arr) ? arr : [arr];
    const newStr = rules.reduce((acc, curr) => {
        return acc.replace(curr, rule);
    }, this);
    return newStr;
}

String.prototype.cleanString = function(arr){
    return this.stringFromTo(arr, '');
}
String.prototype.removeLineBreaks = function(){
    return this.cleanString(lineBreaks);
}

String.prototype.decodeEntities = function(){
    return entities.decode(this);
}

const formatData = (str) => {
    return str.cleanString([parenthesis,  footNotes, sentence]);
}

 
const getlivingBeing = (url, saveFile) =>{
    scrapeIt(url, {
        scientific: {
            selector: '.binomial'
        },
        htmlData:{
            selector: ".infobox.biota",
            how: "html"
        }
    }).then(({ data, response }) => {
        let livingBeingData;
        const { htmlData, scientific } = data;
        if (htmlData == false) return htmlData;
        const lineBreakString = /(\\n)+/g;
        const divider = '|';
        const rawData = JSON.stringify(htmlData)
        .stringFromTo(scapehtmlBreaks, '')
        .stringFromTo(lineBreakString, divider)
        .decodeEntities()
        .split(divider)
        .filter(el => el.indexOf('\"') == -1);

        const source = response.responseUrl;
        const info = normalizeData(rawData);
        const name = getName(info).cleanString(textAfterhtmlBreaks);
        const vulgar = (name!== scientific) ? name : '';
        try{
            livingBeingData = {
                name: {
                    vulgar,
                    synonyms: getSynonyms(info),
                },
                taxonomy: getTaxonomy(info),
                source,
            }
            if(scientific === ''){
                livingBeingData.name.vulgar += ' (Generic)';
            }
            else{
                const {name} = livingBeingData;
                livingBeingData = {
                    ...livingBeingData,
                    name:{
                        ...name,
                        scientific
                    },
                    conservation: getConservation(info),
                }
            }
        }
        catch(error){
            livingBeingData = [error];
        }
        finally{
            if (saveFile){
                const jsonData = JSON.stringify(livingBeingData, null, 2);
                const fileName = name.toLowerCase().replace(/\s{1,}/g, '-');
                const dirName = 'lifes';
                if (!fs.existsSync(dirName)){
                    fs.mkdirSync(dirName);
                }
                fs.writeFileSync(`${dirName}/${fileName}.json`, jsonData);
                console.log('The file was saved.');
            }
            else{
                console.log(livingBeingData);
            }
        }
    })
};

module.exports = getlivingBeing;

