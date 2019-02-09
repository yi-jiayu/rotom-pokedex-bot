"use strict";

const pokemon = require('./pokemon.min.json');
const types = require('./typeStatistics.json');

// check if id_or_name matches a pokemon's id or name
const match = (pokemon, id_or_name) => pokemon.id == id_or_name || pokemon.slug.includes(id_or_name.toLowerCase());

// find the first matching pokemon
const get_pokemon = id_or_name => pokemon.find(p => match(p, id_or_name));

// find all matching pokemon
function* find_pokemon(id_or_name) {
    for (const p of pokemon) {
        if (match(p, id_or_name)) yield p;
    }
}

const capitalise = word => word.charAt(0).toUpperCase() + word.slice(1);        // capitalise a word
const format_type = pokemon => pokemon.type.map(capitalise).join("/");          // join multiple types into one word
const format_height = height => `${Math.floor(height / 12)}' ${height % 12}"`;  // display height in feet and inches

const sort_object_by_value = (obj) => {
    return Object
            .keys(obj)
            .sort((a, b) => obj[b]-obj[a])
            .reduce((_sortedObj, key) => ({
            ..._sortedObj, 
            [key]: obj[key]
            }), {})
}
const format_type_advantage = (obj) => { 
    let str = ""
    let zeroStr = ""
    const sorted_obj = sort_object_by_value(obj)
    Object.keys(sorted_obj).map(item => {
        if (sorted_obj[item]===0){
            zeroStr += `${capitalise(item)}/`
        } else if (sorted_obj[item]!==1) {
            str += `${capitalise(item)}(${sorted_obj[item]}x)/`
        }
    })
    return [str.substring(0, str.length-1), zeroStr.substring(0, zeroStr.length-1)]
}

const format_weak_types = (pokemon_types) => {
    let types_object = {}
    for (const type of pokemon_types) {
        let defense_object = types[type]["defense"]
        Object.keys(defense_object).map(type_item => {
            if (type_item in types_object) {
                types_object[type_item] *= defense_object[type_item]
            } else {
                types_object[type_item] = defense_object[type_item]
            }
        })
    }

    const result = format_type_advantage(types_object)
    const weak_types = result[0]
    const immune_types = result[1]
    if (immune_types==="") {
        return `Weak Against: ${weak_types}`
    } else {
        return `Weak Against: ${weak_types}
Immune to: ${immune_types}`
    }
}   

// format pokemon data as a text string to use in a message
const format_text = pokemon => `*${pokemon.name} (#${pokemon.number})*
Type: ${format_type(pokemon)}
${format_weak_types(pokemon.type)}
Abilities: ${pokemon.abilities.join(', ')}
Height: ${format_height(pokemon.height)}
Weight: ${pokemon.weight} lbs
[Image](${pokemon.ThumbnailImage.replace("detail", "full")})`; // higher res image

// incoming webhook handler
exports.handler = function (req, res) {
    const update = req.body;
    // log to console for debugging
    if (process.env.DEBUG) console.log(JSON.stringify(update)); // eslint-disable-line no-console

    // update is a text message
    if (update.hasOwnProperty("message") && update.message.hasOwnProperty("text")) {
        const message = update.message;
        const id_or_name = message.text.split(" ", 1)[0].substring(0, 20);
        const pokemon = get_pokemon(id_or_name);

        // reply with the sendMessage method
        const reply = {
            method: "sendMessage",
            chat_id: message.chat.id,
        };

        if (pokemon === undefined) {
            reply.text = "Couldn't find a matching Pokémon!";
        } else {
            reply.text = format_text(pokemon);
            reply.parse_mode = "Markdown";
        }

        return res.json(reply);
    } else if (update.hasOwnProperty("inline_query")) { // update is an inline query
        const inline_query = update.inline_query;
        const id_or_name = inline_query.query.split(" ", 1)[0].substring(0, 20);

        // populate an array of inline query results
        const results = [];
        for (const p of find_pokemon(id_or_name)) {
            // skip duplicates
            if (results.find(r => r.id === p.id)) continue;

            const result = {
                type: "article",
                id: p.id,
                title: `${p.name} (#${p.number})`,
                input_message_content: {
                    message_text: format_text(p),
                    parse_mode: "Markdown",
                },
                description: format_type(p),
                thumb_url: p.ThumbnailImage,
            };

            results.push(result);

            // we can only send a max of 50 results at once
            if (results.length === 50) break;
        }

        // don't send anything if there are no matches
        if (results.length === 0) return res.sendStatus(200);

        // reply with the answerInlineQueryMethod
        const reply = {
            method: "answerInlineQuery",
            inline_query_id: inline_query.id,
            results: JSON.stringify(results),
        };

        return res.json(reply);
    }

    // catchall
    return res.sendStatus(200);
};
