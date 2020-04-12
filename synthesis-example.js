// voice parameters detail: see https://cloud.google.com/text-to-speech

// english
var googlehome = require('./google-home-notifier');
googlehome.language(lang = 'en-US', name = 'en-US-Wavenet-C', pitch = 0, speakingRate = 1);
googlehome.synthesis('Google Cloud Text-to-Speech enables developers to synthesize natural-sounding speech with 100+ voices, available in multiple languages and variants. It applies DeepMind’s groundbreaking research in WaveNet and Google’s powerful neural networks to deliver the highest fidelity possible. As an easy-to-use API, you can create lifelike interactions with your users, across many applications and devices.');

// japanese
googlehome.language(lang = 'ja-JP', name = 'ja-JP-Wavenet-B', pitch = -3.2, speakingRate = 1.11);
googlehome.synthesis('高度なディープ ラーニングのニューラル ネットワーク アルゴリズムを利用して、多様な声と言語でテキストから音声を合成します。Google のニューラル ネットワークは音声合成に関する Google の専門知識を基に構築されています。');
