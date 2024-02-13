"use client"

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { FileIcon } from "lucide-react";

import { Item } from "./item";
import { cn } from "@/lib/utils";

interface DocumentListProps {
    parentDocumentId?: Id<"documents">;
    level?: number;
    data?: Doc<"documents">[];
  }

export const DocumentList =({
    parentDocumentId,
    level = 0,
}: DocumentListProps) => {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    // Record는 TypeScript에서 제공하는 제네릭 타입으로, 키-값 쌍을 나타내는 객체를 나타내는 타입
    //expanded 객체는 문자열 키와 불리언 값을 가지게 됨.
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            //이전 상태를 복제하고, documentId 키의 값에 대한 상태를 업데이트(확장 상태 Toggle)
            ...prevExpanded,
            //expanded는 키와 객체를 받으니, 이렇게 표현하는 것임.
            [documentId]: !prevExpanded[documentId]
        }))
    };

    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: parentDocumentId
    });

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

    if ( documents === undefined){
        return(
            <>
            <Item.Skeleton level = {level} />
            {level === 0 && (
                <>
                <Item.Skeleton level = {level}/>
                <Item.Skeleton level = {level}/>
                </>
            )}
            </>
        );
    };

    return(
    <>
        <p
            style = {{
            paddingLeft: level ? `${(level * 12) + 25}px` : undefined
        }}
        className = {cn(
            "hidden text-sm font-medium text-muted-foreground/80",
            expanded && "last:block",
            level === 0 && "hidden"
        )}
        >
         No pages Inside
        </p>
        { documents && documents.map((document) => (
            //documents.map((document)만 쓰면 -> TypeError: null is not an object (evaluating 'documents.map')에러 발생
            //그래서 documents && documents.map((document) 있는지 다 검사해주고 진행하니 에러를 없앨 수 있었음.
            <div key = {document._id}>
                <Item
                id = {document._id}
                onClick = {() => onRedirect(document._id)}
                label = {document.title}
                icon = {FileIcon}
                documentIcon={document.icon}
                active = {params.documentId === document._id}
                level = {level}
                onExpand={() => onExpand(document._id)}
                expanded = {expanded[document._id]}
                />
                {expanded[document._id] && (
                    <DocumentList
                        parentDocumentId={document._id}
                        level ={level + 1}
                        />
                )}
            </div>
        ))}
        </>
    )
};
