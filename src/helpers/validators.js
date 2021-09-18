export const hasRequiredFields = fields => !Object.values(fields).some(field => field === '');
