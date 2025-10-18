import { BadRequestException } from '@nestjs/common';

export const TimeValidation = (str:string) => {
	let timeRegex = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');

	return timeRegex.test(str);
}

export const DecimalValidation = (str:string) => {
	let decimalRegex = /^[1-9]\d*(\.\d+)?$/

	return decimalRegex.test(str)
}

export const StringValidation = (str:string) => {
	let strRegex = /([a-zA-Z])/

	return strRegex.test(str)
}

export const checkSpace = (str:string) => {
	let regex = /\s/

	return regex.test(str)
}

export const UrlValidation = (str:string) => {
	let urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

	return urlRegex.test(str)
}

export const videoExValidation = (str:string) => {
	let videoRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.mp4|.mkv|.3gp|.ogg|.flv|.avi)$/

	return videoRegex.test(str)
}

export const imgExValidation = (str:string) => {
	let imgRegex = /[^\s]+(\.(jpg|jpeg|png|gif|bmp))$/

	return imgRegex.test(str)
}

export const pdfExValidation = (str:string) => {
	let pdfRegex = /[^\s]+(\.(pdf))$/

	return pdfRegex.test(str)
}

export const audioExValidation = (str:string) => {
	let audioRegex = /[^\s]+(\.(ogg|mp3|wav|aac|wma|alac|flac|aiff))$/

	return audioRegex.test(str)
}

export const PhoneIDRValidation = (str:string) => {
	str = (str.charAt(0) === '0') ? str : ('0' + str);

	let strRegex = /^(^\+62\s?|^0)(\d{3,4}-?){2}\d{3,4}$/

	return strRegex.test(str)
}

export const EmailValidation = (str:string) => {
	let strRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/


	return strRegex.test(str)
}

export const NumberValidation = (str:string) => {
	let regex = /^[0-9]*$/
	return regex.test(str)
} 

export const productValid = (check:any) => {
	const { type, boe, ecommerce, price, sale_price } = check
	
	/** Start Type Product Condition */
	if(type && type === 'boe'){	
		return 'boe'
	}

	if(type && type === 'ecommerce'){

		if(!ecommerce){
			throw new BadRequestException('value object (stock) in ecommerce is required, field ecommerce.shipping_charges & ecommerce.weight is optional')
		}

		if(ecommerce.weight && !DecimalValidation(ecommerce.weight)){
			throw new BadRequestException('ecommerce weight must be number (decimal)')
		}

		if(!ecommerce.shipping_charges){
			ecommerce.shipping_charges = false
		}

		if(ecommerce.shipping_charges != false && ecommerce.shipping_charges != true){
			throw new BadRequestException('ecommerce shipping_charges must be true or false')
		}

		if(!ecommerce.stock){
			throw new BadRequestException('ecommerce stock is required')
		}

		if(ecommerce.stock && !DecimalValidation(ecommerce.stock)){
			throw new BadRequestException('ecommerce stock must be number (decimal)')
		}
		
		return 'ecommerce'
	}

	if(type && type === 'bonus'){
		return 'bonus'
	}
	/** End Type Product Condition */

	/** Start Price and Sale Price*/
	if(price && !DecimalValidation(price)){
		throw new BadRequestException('Price must be number (decimal)')
	}

	if(sale_price){
		if(!DecimalValidation(sale_price)){
			throw new BadRequestException('Sale price must be number (decimal)')
		}

		if(Number(price) <= Number(sale_price)){
			throw new BadRequestException('the discount (sale_price) must be smaller than the regular price')
		}
	}
	/** End Price */
	
	return null
}
