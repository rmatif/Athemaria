# Plan d'implémentation : Sélection d'image de couverture pour les histoires

## Objectif
Permettre aux utilisateurs de sélectionner une image de couverture lors de la création d'une histoire, avec une image par défaut (`/assets/cover.png`) si aucune image n'est sélectionnée.

## Fichiers à modifier
1. `app/create-story/page.tsx` - Ajout du champ de sélection d'image
2. `app/write/page.tsx` - Intégration du champ dans le processus d'enregistrement
3. `components/cards/story-card.tsx` - Affichage de l'image de couverture
4. `lib/types.ts` - Vérification du champ existant (déjà présent)

## Étapes d'implémentation

### 1. Modifier le formulaire de création d'histoire (`app/create-story/page.tsx`)
- Ajouter un champ pour l'image de couverture
- Prévoir une option pour utiliser l'image par défaut
- Stocker la valeur dans le localStorage

```diff
+ // Ajouter un état pour l'image de couverture
+ const [coverImage, setCoverImage] = useState("");

// Dans handleSubmit
localStorage.setItem(
  "pendingStory",
  JSON.stringify({
    title,
    description,
    genres: selectedGenres,
    tags: processedTags,
    status: "draft",
+   coverImage: coverImage || "/assets/cover.png"
  })
);
```

### 2. Mettre à jour l'éditeur d'histoire (`app/write/page.tsx`)
- Ajouter le champ coverImage dans les données sauvegardées
- Gérer l'image par défaut si aucun choix

```diff
// Dans handleSave
const newStoryData = {
  title: title.trim(),
  description: description.trim(),
  genres: finalGenres,
  tags: finalTags,
  chapters: chaptersWithTitles,
  status,
  authorId: user.uid,
  authorName: user.displayName || "Anonymous",
  createdAt: new Date().toISOString(),
+ coverImage: coverImage || "/assets/cover.png"
};
```

### 3. Mettre à jour l'affichage des cartes d'histoire (`components/cards/story-card.tsx`)
- Utiliser l'image de couverture dans le composant StoryCard

```diff
export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="overflow-hidden">
-     <img src="/placeholder.jpg" alt={story.title} />
+     <img 
+       src={story.coverImage || "/assets/cover.png"} 
+       alt={story.title} 
+       className="w-full h-48 object-cover"
+     />
      {/* ... */}
    </Card>
  );
}
```

### 4. Gestion de l'image par défaut
- S'assurer que l'image `/assets/cover.png` existe dans le projet
- Vérifier que le chemin est correct dans tous les composants

## Considérations techniques
1. **Performance** : 
   - Les images doivent être optimisées (format WebP, taille appropriée)
   - Implémenter un lazy loading pour les images

2. **Sécurité** :
   - Valider le type MIME des images uploadées
   - Limiter la taille des fichiers

3. **Expérience utilisateur** :
   - Ajouter une prévisualisation de l'image sélectionnée
   - Indiquer clairement l'utilisation de l'image par défaut

## Tests nécessaires
1. Création d'histoire sans sélection d'image → Vérifier l'utilisation de l'image par défaut
2. Création d'histoire avec image personnalisée → Vérifier l'affichage correct
3. Modification d'histoire → Vérifier la persistance de l'image
4. Affichage sur différents devices (mobile, desktop)

## Prochaines étapes
1. Implémenter les modifications en mode "Code"
2. Tester localement
3. Déployer sur l'environnement de staging
4. Recueillir les feedbacks utilisateurs