import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash, Shield, Heart, Zap, Coins, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Character() {
  const { state, dispatch } = useGame();
  const { character } = state;

  const handleUpdate = (field: keyof typeof character, value: any) => {
    dispatch({ type: "UPDATE_CHARACTER", payload: { [field]: value } });
  };

  const handleStatChange = (stat: "pvAtual" | "pvMax" | "pmAtual" | "pmMax" | "forca" | "habilidade" | "dinheiro", amount: number) => {
    let newValue = character[stat] + amount;
    if (stat === "pvAtual" || stat === "pmAtual" || stat === "dinheiro") {
      newValue = Math.max(0, newValue);
    }
    if (stat === "pvAtual" && newValue > character.pvMax) newValue = character.pvMax;
    if (stat === "pmAtual" && newValue > character.pmMax) newValue = character.pmMax;
    
    handleUpdate(stat, newValue);
  };

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState(0);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [editingAttributeName, setEditingAttributeName] = useState("");

  const normalizedAttributeName = newAttributeName.trim().toLocaleLowerCase("pt-BR");
  const isDuplicateAttribute = character.customAttributes.some(
    attribute => attribute.name.toLocaleLowerCase("pt-BR") === normalizedAttributeName,
  );
  const canAddAttribute = normalizedAttributeName.length > 0 && !isDuplicateAttribute;

  const addCustomAttribute = () => {
    if (!canAddAttribute) return;
    dispatch({
      type: "ADD_CUSTOM_ATTRIBUTE",
      payload: {
        id: crypto.randomUUID(),
        name: newAttributeName.trim(),
        value: newAttributeValue,
      },
    });
    setNewAttributeName("");
    setNewAttributeValue(0);
  };

  const startEditingAttribute = (id: string, name: string) => {
    setEditingAttributeId(id);
    setEditingAttributeName(name);
  };

  const saveAttributeName = (id: string) => {
    const name = editingAttributeName.trim();
    const duplicate = character.customAttributes.some(
      attribute =>
        attribute.id !== id
        && attribute.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"),
    );
    if (!name || duplicate) return;
    dispatch({ type: "UPDATE_CUSTOM_ATTRIBUTE", payload: { id, name } });
    setEditingAttributeId(null);
    setEditingAttributeName("");
  };

  const changeCustomAttribute = (id: string, value: number) => {
    dispatch({ type: "UPDATE_CUSTOM_ATTRIBUTE", payload: { id, value } });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      quantity: newItemQty,
      description: "",
      equipped: false,
      consumable: false,
    };
    handleUpdate("inventory", [...character.inventory, newItem]);
    setNewItemName("");
    setNewItemQty(1);
  };

  const handleRemoveItem = (id: string) => {
    handleUpdate("inventory", character.inventory.filter((i: any) => i.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-3xl font-serif text-accent mb-4">Ficha de Personagem</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Herói</Label>
                <Input 
                  id="name" 
                  value={character.name} 
                  onChange={(e) => handleUpdate("name", e.target.value)} 
                  className="font-serif text-lg bg-background"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Heart className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Vida (PV)</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pvAtual", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.pvAtual}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pvAtual", 1)}>+</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Max: {character.pvMax}</div>
                </div>

                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Zap className="h-5 w-5 text-sky-700 mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Magia (PM)</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pmAtual", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.pmAtual}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pmAtual", 1)}>+</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Max: {character.pmMax}</div>
                </div>

                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Shield className="h-5 w-5 text-accent mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Força</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("forca", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.forca}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("forca", 1)}>+</Button>
                  </div>
                </div>

                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Shield className="h-5 w-5 text-accent mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Habilidade</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("habilidade", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.habilidade}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("habilidade", 1)}>+</Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
                <Coins className="h-6 w-6 text-amber-600" />
                <Label className="uppercase text-muted-foreground">Peças de Ouro</Label>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleStatChange("dinheiro", -1)}>-</Button>
                  <span className="text-xl font-bold w-12 text-center">{character.dinheiro}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleStatChange("dinheiro", 1)}>+</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-2xl font-serif text-accent mb-4">Atributos Personalizados</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Características da jornada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <form
              className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                addCustomAttribute();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="new-attribute-name">Nome do atributo</Label>
                <Input
                  id="new-attribute-name"
                  value={newAttributeName}
                  onChange={(event) => setNewAttributeName(event.target.value)}
                  placeholder="Ex.: Coragem"
                  maxLength={40}
                  aria-invalid={isDuplicateAttribute}
                  aria-describedby={isDuplicateAttribute ? "attribute-name-error" : undefined}
                />
                {isDuplicateAttribute && (
                  <p id="attribute-name-error" className="text-xs text-destructive" role="alert">
                    Já existe um atributo com esse nome.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-attribute-value">Valor inicial</Label>
                <Input
                  id="new-attribute-value"
                  type="number"
                  value={newAttributeValue}
                  onChange={(event) => setNewAttributeValue(Number(event.target.value) || 0)}
                />
              </div>
              <Button type="submit" disabled={!canAddAttribute}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </form>

            {character.customAttributes.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {character.customAttributes.map(attribute => {
                  const linkedModifiers = state.modifiers.filter(
                    modifier => modifier.target === `atributo:${attribute.id}`,
                  ).length;
                  const duplicateEditName = character.customAttributes.some(
                    item =>
                      item.id !== attribute.id
                      && item.name.toLocaleLowerCase("pt-BR")
                        === editingAttributeName.trim().toLocaleLowerCase("pt-BR"),
                  );
                  const canSaveName = editingAttributeName.trim().length > 0 && !duplicateEditName;

                  return (
                    <div key={attribute.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        {editingAttributeId === attribute.id ? (
                          <form
                            className="flex min-w-0 flex-1 gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              saveAttributeName(attribute.id);
                            }}
                          >
                            <Input
                              value={editingAttributeName}
                              onChange={(event) => setEditingAttributeName(event.target.value)}
                              maxLength={40}
                              autoFocus
                              aria-label={`Novo nome para ${attribute.name}`}
                              aria-invalid={duplicateEditName}
                            />
                            <Button type="submit" size="icon" disabled={!canSaveName} aria-label="Salvar nome">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingAttributeId(null)}
                              aria-label="Cancelar edição"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </form>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <p className="truncate font-serif text-lg font-semibold text-accent">
                                {attribute.name}
                              </p>
                              {linkedModifiers > 0 && (
                                <Badge variant="secondary" className="mt-1">
                                  {linkedModifiers} {linkedModifiers === 1 ? "modificador" : "modificadores"}
                                </Badge>
                              )}
                            </div>
                            <div className="flex shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingAttribute(attribute.id, attribute.name)}
                                aria-label={`Renomear ${attribute.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label={`Remover ${attribute.name}`}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover {attribute.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      O atributo será removido da ficha e dos próximos testes.
                                      {linkedModifiers > 0
                                        ? ` ${linkedModifiers} ${linkedModifiers === 1 ? "modificador associado também será removido" : "modificadores associados também serão removidos"}.`
                                        : " O histórico de testes continuará intacto."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => dispatch({ type: "REMOVE_CUSTOM_ATTRIBUTE", payload: attribute.id })}
                                    >
                                      Remover atributo
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => changeCustomAttribute(attribute.id, attribute.value - 1)}
                          aria-label={`Diminuir ${attribute.name}`}
                        >
                          -
                        </Button>
                        <span className="min-w-12 text-center text-3xl font-bold font-serif">
                          {attribute.value}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => changeCustomAttribute(attribute.id, attribute.value + 1)}
                          aria-label={`Aumentar ${attribute.name}`}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Nenhum atributo personalizado. Adicione apenas os que sua jornada precisar.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-2xl font-serif text-accent mb-4">Inventário</h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Novo item..." 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <Input 
                type="number" 
                min="1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button onClick={handleAddItem}><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-2 mt-4">
              {character.inventory.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="secondary">Qtd: {item.quantity}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {character.inventory.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Inventário vazio.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-2xl font-serif text-accent mb-4">Anotações do Personagem</h3>
        <Card>
          <CardContent className="pt-6">
            <Textarea 
              value={character.notes}
              onChange={(e) => handleUpdate("notes", e.target.value)}
              className="min-h-[150px] font-serif bg-background"
              placeholder="História, maldições, bênçãos, títulos..."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
