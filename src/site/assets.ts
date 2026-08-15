import copsWeapon from '../assets/homepage/cops-ak47.png';
import copsBreach from '../assets/homepage/cops-breach.png';
import copsCoalition from '../assets/homepage/cops-coalition.png';
import copsHero from '../assets/homepage/cops-hero.jpg';
import copsLogo from '../assets/homepage/cops-logo-short.png';
import rank4Icon from '../assets/ranks/rank-4-platinum.png';
import rank5Icon from '../assets/ranks/rank-5-diamond.png';
import rank6Icon from '../assets/ranks/rank-6-master.png';
import rank7Icon from '../assets/ranks/rank-7-specops.png';
import rank8Icon from '../assets/ranks/rank-8-elite.png';

export type SiteAsset = {
	body: ArrayBuffer;
	contentType: string;
};

const SITE_ASSETS: Readonly<Record<string, SiteAsset>> = {
	'/assets/cops-hero.jpg': { body: copsHero, contentType: 'image/jpeg' },
	'/assets/cops-coalition.png': { body: copsCoalition, contentType: 'image/png' },
	'/assets/cops-breach.png': { body: copsBreach, contentType: 'image/png' },
	'/assets/cops-ak47.png': { body: copsWeapon, contentType: 'image/png' },
	'/assets/cops-logo.png': { body: copsLogo, contentType: 'image/png' },
	'/assets/rank-platinum.png': { body: rank4Icon, contentType: 'image/png' },
	'/assets/rank-diamond.png': { body: rank5Icon, contentType: 'image/png' },
	'/assets/rank-master.png': { body: rank6Icon, contentType: 'image/png' },
	'/assets/rank-specops.png': { body: rank7Icon, contentType: 'image/png' },
	'/assets/rank-elite.png': { body: rank8Icon, contentType: 'image/png' },
	'/favicon.png': { body: copsLogo, contentType: 'image/png' },
	'/favicon.ico': { body: copsLogo, contentType: 'image/png' },
};

export const SITE_ART = {
	hero: '/assets/cops-hero.jpg',
	coalition: '/assets/cops-coalition.png',
	breach: '/assets/cops-breach.png',
	weapon: '/assets/cops-ak47.png',
	logo: '/assets/cops-logo.png',
	platinum: '/assets/rank-platinum.png',
	diamond: '/assets/rank-diamond.png',
	master: '/assets/rank-master.png',
	specops: '/assets/rank-specops.png',
	elite: '/assets/rank-elite.png',
} as const;

export function getSiteAsset(pathname: string): SiteAsset | undefined {
	return SITE_ASSETS[pathname];
}
