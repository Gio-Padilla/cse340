-- 1 ----------------------
INSERT INTO public.account VALUES
	(DEFAULT, 'Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n', DEFAULT);

-- 2 ----------------------
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- 3 ----------------------
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- 4 ----------------------
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5 ----------------------
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification AS c
    ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6 ----------------------
UPDATE public.inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');