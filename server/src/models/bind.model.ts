import { Schema, model, Document } from 'mongoose';

const bindSchema = new Schema({
	API: {
		type: String,
		required: true,
	},
	APIKEY: {
		type: String,
		required: true
	}
});

const Bind = model('Bind', bindSchema);
export default Bind;