'use strict';

const pokemon = require('./pokemon.min.json');

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

// capitalise a word
const capitalise = word => word.charAt(0).toUpperCase() + word.slice(1);

// converts a height in inches to feet and inches
const format_height = height => `${Math.floor(height / 12)}' ${height % 12}"`;

// returns a pokemon's type as a single word, eg. 'Grass/Poison'
const format_type = pokemon => pokemon.type.map(capitalise).join('/');

// format pokemon data as a text string to use in a message
const format_text = pokemon => `*${pokemon.name} (#${pokemon.number})*
Type: ${format_type(pokemon)}
Abilities: ${pokemon.abilities.join(', ')}
Height: ${format_height(pokemon.height)}
Weight: ${pokemon.weight} lbs
[Image](${pokemon.ThumbnailImage})`;

// incoming webhook handler
exports.handler = function (req, res) {
    const update = req.body;
    console.log(JSON.stringify(update));

    // update is a text message
    if (update.hasOwnProperty('message') && update.message.hasOwnProperty('text')) {
        const message = update.message;
        const id_or_name = message.text.split(' ', 1)[0].substring(0, 20);
        const pokemon = get_pokemon(id_or_name);

        const reply = {
            method: 'sendMessage',
            chat_id: message.chat.id,
        };

        if (pokemon === undefined) {
            reply.text = "Couldn't find a matching Pokémon!";
        } else {
            reply.text = format_text(pokemon);
            reply.parse_mode = 'Markdown';
        }

        return res.json(reply);
    } else if (update.hasOwnProperty('inline_query')) { // update is an inline query
        const inline_query = update.inline_query;
        const id_or_name = inline_query.query.split(' ', 1)[0].substring(0, 20);

        const results = [];
        for (const p of find_pokemon(id_or_name)) {
            // skip duplicates
            if (results.find(r => r.id === p.id)) continue;

            const result = {
                type: 'article',
                id: p.id,
                title: `${p.name} (#${p.number})`,
                input_message_content: {
                    message_text: format_text(p),
                    parse_mode: 'Markdown',
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

        const reply = {
            method: 'answerInlineQuery',
            inline_query_id: inline_query.id,
            results: JSON.stringify(results),
        };

        return res.json(reply);
    }

    // catchall
    return res.sendStatus(200);
};
