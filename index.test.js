const bot = require('./index.js');

function newMessage(text) {
    return {
        message: {
            chat: {
                id: 1,
            },
            text,
        }
    }
}

function newInlineQuery(query) {
    return {
        inline_query: {
            id: 1,
            query,
        }
    }
}

describe('when messaged directly', () => {
    test('with full pokemon name', () => {
        const json = jest.fn();
        bot.handler({body: newMessage('turtwig')}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "parse_mode": "Markdown",
            "text": `*Turtwig (#387)*
Type: Grass
Abilities: Overgrow
Height: 1' 4"
Weight: 22.5 lbs
[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)`
        });
    });

    test('with partial pokemon name', () => {
        const json = jest.fn();
        bot.handler({body: newMessage('turt')}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "parse_mode": "Markdown",
            "text": `*Turtwig (#387)*
Type: Grass
Abilities: Overgrow
Height: 1' 4"
Weight: 22.5 lbs
[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)`
        });
    });

    test('with nonexistent pokemon name', () => {
        const json = jest.fn();
        bot.handler({body: newMessage('digimon')}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "text": "Couldn't find a matching Pokémon!"
        });
    })
});

describe('when sent an inline query', function () {
    test('with full pokemon name', () => {
        const json = jest.fn();
        bot.handler({body: newInlineQuery('turtwig')}, {json});
        const reply = json.mock.calls[0][0];
        expect(reply.inline_query_id).toEqual(1);
        expect(reply.method).toEqual('answerInlineQuery');
        expect(JSON.parse(reply.results)).toEqual([
            {
                "description": "Grass",
                "id": 387,
                "input_message_content": {
                    "message_text": "*Turtwig (#387)*\nType: Grass\nAbilities: Overgrow\nHeight: 1' 4\"\nWeight: 22.5 lbs\n[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)",
                    "parse_mode": "Markdown"
                },
                "thumb_url": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/387.png",
                "title": "Turtwig (#387)",
                "type": "article"
            }
        ]);
    });

    test('with partial pokemon name', () => {
        const json = jest.fn();
        bot.handler({body: newInlineQuery('turt')}, {json});
        const reply = json.mock.calls[0][0];
        expect(reply.inline_query_id).toEqual(1);
        expect(reply.method).toEqual('answerInlineQuery');
        expect(JSON.parse(reply.results)).toEqual([
            {
                "description": "Grass",
                "id": 387,
                "input_message_content": {
                    "message_text": "*Turtwig (#387)*\nType: Grass\nAbilities: Overgrow\nHeight: 1' 4\"\nWeight: 22.5 lbs\n[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)",
                    "parse_mode": "Markdown"
                },
                "thumb_url": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/387.png",
                "title": "Turtwig (#387)",
                "type": "article"
            },
            {
                "description": "Fire/Dragon",
                "id": 776,
                "input_message_content": {
                    "message_text": "*Turtonator (#776)*\nType: Fire/Dragon\nAbilities: Shell Armor\nHeight: 6' 7\"\nWeight: 467.4 lbs\n[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/776.png)",
                    "parse_mode": "Markdown"
                },
                "thumb_url": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/776.png",
                "title": "Turtonator (#776)",
                "type": "article"
            }
        ]);
    });

    test('with nonexistent pokemon name', () => {
        const sendStatus = jest.fn();
        bot.handler({body: newInlineQuery('digimon')}, {sendStatus});
        expect(sendStatus.mock.calls[0][0]).toEqual(200);
    });
});
