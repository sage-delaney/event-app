import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type Tag = { id: number; name: string; slug: string };

type TagsByCategoryResult = {
  tags: Tag[];
  slugToId: { [key: string]: number };
  idToName: { [key: number]: string };
};

async function fetchTagsByCategory(categoryName: string): Promise<TagsByCategoryResult> {
  const { data: category, error: categoryError } = await supabase
    .from('tag_categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!category) {
    throw new Error(`Category "${categoryName}" not found.`);
  }

  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('category_id', category.id);

  if (tagsError) {
    throw new Error(tagsError.message);
  }

  const slugToId: { [key: string]: number } = {};
  const idToName: { [key: number]: string } = {};

  tags.forEach(tag => {
    slugToId[tag.slug] = tag.id;
    idToName[tag.id] = tag.name;
  });

  return { tags, slugToId, idToName };
}

export function useTagsByCategory(categoryName: string) {
  const queryInfo = useQuery<TagsByCategoryResult, Error>({
    queryKey: ['tags', categoryName],
    queryFn: () => fetchTagsByCategory(categoryName),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    ...queryInfo,
    tags: queryInfo.data?.tags || [],
    slugToId: queryInfo.data?.slugToId || {},
    idToName: queryInfo.data?.idToName || {},
  };
}
